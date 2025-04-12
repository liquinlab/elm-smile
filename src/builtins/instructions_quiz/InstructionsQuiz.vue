<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// read in props
const props = defineProps({
  questions: {
    type: Object,
    required: true,
  },
  returnTo: {
    type: String,
    required: false,
    default: 'instructions',
  },
  randomizeQandA: {
    type: Boolean,
    required: false,
    default: true,
  },
})
let qs = props.questions

function init() {
  // randomize questions and add to stepper
  qs = props.randomizeQandA ? getRandomizedQuestions() : props.questions

  console.log('qs', props.questions)
  const pages = api
    .spec()
    .append({ path: 'pages' })
    .forEach((row) => {
      row.append(qs)
    })
  api.addSpec(pages, true)

  const feedback = api
    .spec()
    .append({ path: 'feedback' })
    .forEach((row) => {
      row.append([{ path: 'success' }, { path: 'retry' }]) // add to additional pages
    })
  api.addSpec(feedback, true)

  if (!api.globals.attempts) {
    api.globals.attempts = 1
  }

  console.log('api.stepData.questions', api.stepData.questions)
}

function getRandomizedQuestions() {
  api.randomSeed() // randomize seed
  return props.questions.map((page) => ({
    ...page,
    questions: api.shuffle(
      page.questions.map((q) => ({
        ...q,
        answers: api.shuffle(q.answers),
      }))
    ),
  }))
}

function autofill() {
  // Helper function to recursively find and update questions in states
  function updateQuestionsInState(state) {
    // Check if this state has questions
    if (state.data?.questions && Array.isArray(state.data.questions)) {
      state.data.questions = state.data.questions.map((question) => ({
        ...question,
        answer: question.multiSelect ? question.correctAnswer : question.correctAnswer[0],
      }))
    }

    // Recursively check all child states
    state._states.forEach(updateQuestionsInState)
  }

  // Start from root state and traverse all states
  console.log('api.sm', api.sm)
  updateQuestionsInState(api.sm)
}

api.setAutofill(autofill)

// Update quizCorrect to handle multiple answers
const quizCorrect = computed(() =>
  api.stepData?.questions?.every((question) => {
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
  if (!api.stepData?.questions || !Array.isArray(api.stepData.questions)) {
    return false
  }
  return api.stepData.questions.every((question) => {
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
  api.recordData({
    phase: 'INSTRUCTIONS_QUIZ',
    questions: api.stepperData('pages*'), // Update to use randomized questions
    globals: api.globals,
  })
  if (quizCorrect.value) {
    api.goToStep('feedback-success')
  } else {
    api.goToStep('feedback-retry')
  }
}

function returnInstructions() {
  api.reset() // reset the quiz
  api.clear() // don't remember across reloads
  //init()
  api.globals.attempts = api.globals.attempts + 1 // increment attempts
  api.goToView(props.returnTo) // go back to instructions
}

function finish() {
  api.goNextView()
}

init()
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <!-- Replace the two quiz page sections with this single dynamic one -->
      <div class="formstep" v-if="api.stepIndex <= qs.length && /^pages-pg\d+$/.test(api.paths)">
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
              <div v-for="(question, index) in api.stepData.questions" :key="question.id" class="mb-5">
                <FormKit
                  :type="question.multiSelect ? 'checkbox' : 'select'"
                  :label="question.question"
                  :name="question.id"
                  :placeholder="question.multiSelect ? 'Select options' : 'Select option'"
                  v-model="api.stepData.questions[index].answer"
                  :options="question.answers"
                  validation="required"
                  :multiple="question.multiSelect"
                />
              </div>
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-left">
                    <button v-if="api.stepIndex > 1" class="button is-warning" @click="api.goPrevStep()">
                      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; Previous page
                    </button>
                  </div>
                </div>
                <div class="column">
                  <div class="has-text-right">
                    <button
                      v-if="currentPageComplete"
                      :class="['button', api.stepIndex === qs.length ? 'is-success' : 'is-warning']"
                      @click="api.stepIndex === qs.length ? submitQuiz() : api.goNextStep()"
                    >
                      {{ api.stepIndex === qs.length ? 'Submit' : 'Next page' }}
                      <template v-if="api.stepIndex !== qs.length">
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

      <div class="formstep" v-else-if="api.paths === 'feedback-success'">
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

      <div class="formstep" v-else-if="api.paths === 'feedback-retry'">
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
  width: 95%; /* Default for mobile */
  margin: auto;
  margin-bottom: 10px;
  padding-bottom: 10px;
  text-align: left;
}

@media screen and (min-width: 569px) {
  .formcontent {
    width: 85%; /* Tablet */
  }
}

@media screen and (min-width: 1024px) {
  .formcontent {
    width: 98%; /* Desktop */
  }
}
</style>
