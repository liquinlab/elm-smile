<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
const stepper = api.useStepper()
stepper.clear() // don't remember across reloads

// read in props
const props = defineProps({
  quizQuestions: {
    type: Object,
    required: true,
  },
  returnTo: {
    type: String,
    required: false,
    default: 'instructions',
  },
  randomizeQuestionsAndAnswers: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const randomizedQuestions = ref(
  props.quizQuestions.map((page) => ({
    ...page,
    questions: api.shuffle(
      page.questions.map((q) => ({
        ...q,
        answers: api.shuffle(q.answers),
      }))
    ),
  }))
)

function randomizeQuestions() {
  if (props.randomizeQuestionsAndAnswers) {
    // randomize seed
    api.randomSeed()
  }
  console.log('randomizing questions')
  randomizedQuestions.value = props.quizQuestions.map((page) => ({
    ...page,
    questions: api.shuffle(
      page.questions.map((q) => ({
        ...q,
        answers: api.shuffle(q.answers),
      }))
    ),
  }))
}

// Call randomization when component mounts
onMounted(() => {
  randomizeQuestions()
  stepper.t
    .append(randomizedQuestions.value)
    .append([{ path: 'start_task' }, { path: 'retry' }]) // add to additional pages
    .push()
})

function autofill() {
  // Get all states except SOS and EOS
  const quizStates = stepper.sm.states.filter(
    (state) => state.id !== 'SOS' && state.id !== 'EOS' && state.data?.questions
  )

  // Update each state's questions with correct answers
  quizStates.forEach((state) => {
    if (state.data.questions) {
      state.data.questions = state.data.questions.map((question) => ({
        ...question,
        answer: question.multiSelect ? question.correctAnswer : question.correctAnswer[0],
      }))
    }
  })
}
api.setPageAutofill(autofill)

// Update quizCorrect to handle multiple answers
const quizCorrect = computed(() =>
  stepper.data?.questions?.every((question) => {
    if (Array.isArray(question.correctAnswer)) {
      // For multiselect, check if arrays have same values regardless of order
      const selectedAnswers = Array.isArray(question.answer) ? question.answer : [question.answer]
      return (
        question.correctAnswer.length === selectedAnswers.length &&
        question.correctAnswer.every((answer) => selectedAnswers.includes(answer))
      )
    }
    // For single select, keep existing behavior
    return question.answer === question.correctAnswer[0]
  })
)

const currentPageComplete = computed(() => {
  if (!stepper.data?.questions) {
    return false
  }
  return stepper.data.questions.every((question) => {
    if ('answer' in question) {
      // For multiselect, ensure at least one option is selected
      if (question.multiselect) {
        return Array.isArray(question.answer) && question.answer.length > 0
      }
      return true
    }
    return false
  })
})

function submitQuiz() {
  api.recordTrialData({
    phase: 'INSTRUCTIONS_QUIZ',
    questions: randomizedQuestions.value, // Update to use randomized questions
    answers: stepper.data.questions.map((question) => question.answer),
  })
  if (quizCorrect.value) {
    stepper.goTo('start_task')
  } else {
    stepper.goTo('retry')
  }
}

function returnInstructions() {
  stepper.reset() // reset the quiz
  randomizeQuestions() // re-randomize questions
  api.goToView(props.returnTo)
}

function finish() {
  api.goNextView()
}

// randomize questions and add to stepper
randomizeQuestions()
stepper.t
  .append(randomizedQuestions.value)
  .append([{ path: 'start_task' }, { path: 'retry' }]) // add to additional pages
  .push()
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <!-- Replace the two quiz page sections with this single dynamic one -->
      <div class="formstep" v-if="stepper.index <= randomizedQuestions.length && /^quiz_page\d+$/.test(stepper.path)">
        <div class="formheader">
          <h3 class="is-size-3 has-text-weight-bold">
            <FAIcon icon="fa-solid fa-square-check" />&nbsp;Did we explain things clearly?
          </h3>
          <p class="is-size-6">
            Using the information provided in the previous pages, please select the correct answer for each question. Do
            your best! If anything is unclear you can review the instructions again after you submit your response.
          </p>
        </div>
        <div class="columns">
          <div class="column is-one-third">
            <div class="formsectionexplainer">
              <h3 class="is-size-6 has-text-weight-bold">Test your understanding</h3>
              <p class="is-size-6">You must answer all the questions in order to move on.</p>
            </div>
          </div>
          <div class="column">
            <div class="box is-shadowless formbox">
              <div v-for="question in stepper.data.questions" :key="question.id" class="mb-5">
                <FormKit
                  :type="question.multiSelect ? 'checkbox' : 'select'"
                  :label="question.question"
                  :name="question.id"
                  :placeholder="question.multiSelect ? 'Select options' : 'Select option'"
                  v-model="stepper.data.questions[stepper.data.questions.indexOf(question)].answer"
                  :options="question.multiSelect ? question.answers : question.answers"
                  validation="required"
                  :multiple="question.multiSelect"
                />
              </div>
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-left">
                    <button v-if="stepper.index > 1" class="button is-warning" @click="stepper.prev()">
                      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; Previous page
                    </button>
                  </div>
                </div>
                <div class="column">
                  <div class="has-text-right">
                    <button
                      v-if="currentPageComplete"
                      :class="['button', stepper.index === randomizedQuestions.length ? 'is-success' : 'is-warning']"
                      @click="stepper.index === randomizedQuestions.length ? submitQuiz() : stepper.next()"
                    >
                      {{ stepper.index === randomizedQuestions.length ? 'Submit' : 'Next page' }}
                      <template v-if="stepper.index !== randomizedQuestions.length">
                        &nbsp;<FAIcon icon="fa-solid fa-arrow-right" />
                      </template>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="formstep" v-else-if="stepper.paths === 'start_task'">
        <div class="formheader">
          <h3 class="is-size-3 has-text-weight-bold has-text-centered">
            <FAIcon icon="fa-solid fa-square-check" />&nbsp;Congrats! You passed.
          </h3>
          <p class="is-size-5 has-text-centered">Click here to begin the next phase of the experiment.</p>
        </div>
        <div class="has-text-centered">
          <button class="button is-warning" @click="finish">Let's begin.</button>
        </div>
      </div>

      <div class="formstep" v-else-if="stepper.paths === 'retry'">
        <div class="formheader">
          <h3 class="is-size-3 has-text-weight-bold has-text-centered">
            <FAIcon icon="fa-solid fa-square-check" />&nbsp;Sorry! You did not get all the answers correct.
          </h3>
          <p class="is-size-5 has-text-centered">Please re-read the instructions and try again.</p>
        </div>
        <div class="has-text-centered">
          <button class="button is-warning" @click="returnInstructions">Back to Instructions</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-box {
  border: 1px solid #dfdfdf;
  background-color: rgb(248, 248, 248);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 30px;
}

.formstep {
  margin-top: 0px;
}

.formheader {
  margin-bottom: 40px;
}

.formbox {
  border: 1px solid #dfdfdf;
  text-align: left;
  padding: 20px;
  background-color: rgb(248, 248, 248);
}

.formcontent {
  width: 80%;
  margin: auto;
  margin-bottom: 10px;
  padding-bottom: 10px;
  text-align: left;
}
</style>
