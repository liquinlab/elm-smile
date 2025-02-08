<script setup>
import { reactive, computed } from 'vue'
import useAPI from '@/core/composables/useAPI'

const api = useAPI()

const QUIZ_QUESTIONS = [
  {
    page: 1,
    questions: [
      {
        id: 'example1',
        question: 'What color is the sky?',
        multiSelect: false,
        answers: ['red', 'blue', 'yellow', 'rainbow'],
        correctAnswer: ['blue'],
      },
      {
        id: 'example2',
        question: 'How many days are in a non-leap year?',
        multiSelect: false,
        answers: ['365', '100', '12', '31', '60'],
        correctAnswer: ['365'],
      },
    ],
  },
  {
    page: 2,
    questions: [
      {
        id: 'example3',
        question: 'What comes next: North, South, East, ___',
        multiSelect: false,
        answers: ['Southeast', 'Left', 'West'],
        correctAnswer: ['West'],
      },
      {
        id: 'example4',
        question: "What's 7 x 7?",
        multiSelect: false,
        answers: ['63', '59', '49', '14'],
        correctAnswer: ['49'],
      },
    ],
  },
]

function autofill() {
  quizState.answers = QUIZ_QUESTIONS.map((page) => page.questions.map((question) => question.correctAnswer[0]))
}
api.setPageAutofill(autofill)

const pages = QUIZ_QUESTIONS.map((_, index) => `page${index + 1}`)
const { nextStep, step_index, prevStep, resetStep } = api.useStepper(pages, () => {
  finish()
})

const quizState = reactive({
  page: 'quiz',
  answers: QUIZ_QUESTIONS.map((page) => Array(page.questions.length).fill(null)),
})

const quiz_complete = computed(() =>
  QUIZ_QUESTIONS.every((page, pageIndex) =>
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
  if (quiz_complete.value) {
    quizState.page = 'start'
  } else {
    quizState.page = 'retry'
  }
}

function returnInstructions() {
  resetStep() // reset the quiz
  api.gotoView('instructions')
}

function finish() {
  api.stepNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <h3 class="is-size-3 has-text-weight-bold">
        <FAIcon icon="fa-solid fa-square-check" />&nbsp;Did we explain things clearly?
      </h3>
      <p class="is-size-6">
        Using the information provided in the previous pages, please select the correct answer for each question.
      </p>

      <!-- Replace the two quiz page sections with this single dynamic one -->
      <div class="formstep" v-if="quizState.page === 'quiz' && step_index < QUIZ_QUESTIONS.length">
        <div class="columns">
          <div class="column is-one-third">
            <div class="formsectionexplainer">
              <h3 class="is-size-6 has-text-weight-bold">Test your understanding</h3>
              <p class="is-size-6">
                Do your best! If anything is unclear you can review again after you submit your response.
              </p>
            </div>
          </div>
          <div class="column">
            <div class="box is-shadowless formbox">
              <div v-for="question in QUIZ_QUESTIONS[step_index].questions" :key="question.id" class="mb-5">
                <FormKit
                  type="select"
                  :label="question.question"
                  :name="question.id"
                  placeholder="Select an option"
                  v-model="quizState.answers[step_index][QUIZ_QUESTIONS[step_index].questions.indexOf(question)]"
                  :options="question.answers"
                  validation="required"
                />
              </div>
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-left">
                    <button v-if="step_index > 0" class="button is-warning" @click="prevStep">
                      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; Previous
                    </button>
                  </div>
                </div>
                <div class="column">
                  <div class="has-text-right">
                    <button
                      v-if="currentPageComplete"
                      :class="['button', step_index === QUIZ_QUESTIONS.length - 1 ? 'is-success' : 'is-warning']"
                      @click="step_index === QUIZ_QUESTIONS.length - 1 ? submitQuiz() : nextStep()"
                    >
                      {{ step_index === QUIZ_QUESTIONS.length - 1 ? 'Submit' : 'Continue' }}
                      <template v-if="step_index !== QUIZ_QUESTIONS.length - 1">
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
        <div class="columns">
          <div class="column is-full">
            <div class="has-text-centered">
              <h3 class="is-size-4 has-text-weight-bold mb-4">You passed!</h3>
              <p class="mb-4">Click here to start the experiment.</p>
              <button class="button is-warning" @click="finish">Let's begin.</button>
            </div>
          </div>
        </div>
      </div>

      <div class="formstep" v-else-if="quizState.page === 'retry'">
        <div class="columns">
          <div class="column is-full">
            <div class="has-text-centered">
              <h3 class="is-size-4 has-text-weight-bold mb-4">Re-read the Instructions</h3>
              <p class="mb-4">
                Oops! You did not get all the answers correct. Please re-read the instructions and try again.
              </p>
              <button class="button is-warning" @click="returnInstructions">Back to Instructions</button>
            </div>
          </div>
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
  margin-top: 20px;
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
