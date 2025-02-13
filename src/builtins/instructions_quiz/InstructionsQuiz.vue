<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

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

if (props.randomizeQuestionsAndAnswers) {
  // randomize seed
  api.randomSeed()
}

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
})

function autofill() {
  quizState.answers = randomizedQuestions.value.map((page) =>
    page.questions.map((question) => question.correctAnswer[0])
  )
}
api.setPageAutofill(autofill)

// Update the pages array to use randomizedQuestions length
const pages = randomizedQuestions.value.map((_, index) => `page${index + 1}`)
const stepper = api.useStepper(pages, () => {
  finish()
})

// Update quizState to use randomizedQuestions length
const quizState = reactive({
  page: 'quiz',
  answers: randomizedQuestions.value.map((page) => Array(page.questions.length).fill(null)),
})

// Update quizCorrect to use randomizedQuestions
const quizCorrect = computed(() =>
  randomizedQuestions.value.every((page, pageIndex) =>
    page.questions.every(
      (question, questionIndex) => quizState.answers[pageIndex][questionIndex] === question.correctAnswer[0]
    )
  )
)
const currentPageComplete = computed(() => {
  if (!quizState.answers || !quizState.answers[step_index.value]) {
    return false
  }
  return quizState.answers[step_index.value].every((answer) => answer !== null)
})

function submitQuiz() {
  api.recordTrialData({
    phase: 'INSTRUCTIONS_QUIZ',
    questions: randomizedQuestions.value, // Update to use randomized questions
    answers: quizState.answers,
  })
  if (quizCorrect.value) {
    quizState.page = 'start'
  } else {
    quizState.page = 'retry'
  }
}

function returnInstructions() {
  resetStep() // reset the quiz
  randomizeQuestions() // re-randomize questions
  api.gotoView(props.returnTo)
}

function finish() {
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <!-- Replace the two quiz page sections with this single dynamic one -->
      <div class="formstep" v-if="quizState.page === 'quiz' && step_index < randomizedQuestions.length">
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
              <div v-for="question in randomizedQuestions[step_index].questions" :key="question.id" class="mb-5">
                <FormKit
                  type="select"
                  :label="question.question"
                  :name="question.id"
                  placeholder="Select an option"
                  v-model="quizState.answers[step_index][randomizedQuestions[step_index].questions.indexOf(question)]"
                  :options="question.answers"
                  validation="required"
                />
              </div>
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-left">
                    <button v-if="step_index > 0" class="button is-warning" @click="prevStep">
                      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; Previous page
                    </button>
                  </div>
                </div>
                <div class="column">
                  <div class="has-text-right">
                    <button
                      v-if="currentPageComplete"
                      :class="['button', step_index === randomizedQuestions.length - 1 ? 'is-success' : 'is-warning']"
                      @click="step_index === randomizedQuestions.length - 1 ? submitQuiz() : nextStep()"
                    >
                      {{ step_index === randomizedQuestions.length - 1 ? 'Submit' : 'Next page' }}
                      <template v-if="step_index !== randomizedQuestions.length - 1">
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

      <div class="formstep" v-else-if="quizState.page === 'start'">
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

      <div class="formstep" v-else-if="quizState.page === 'retry'">
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
