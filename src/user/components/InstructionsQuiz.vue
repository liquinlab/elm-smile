<script setup>
import { reactive, computed } from 'vue'
import useAPI from '@/core/composables/useAPI'

const api = useAPI()

const quizState = reactive({
  page: 'quiz',
  answers: Array(4).fill(null),
})

const QUIZ_QUESTIONS = [
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
]

const quiz_complete = computed(() =>
  quizState.answers.every((answer, index) => answer === QUIZ_QUESTIONS[index].correctAnswer[0])
)

function submitQuiz() {
  if (quiz_complete.value) {
    quizState.page = 'start'
  } else {
    quizState.page = 'retry'
  }
}

function returnInstructions() {
  api.gotoView('instructions')
}

function finish() {
  api.stepNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <h3 class="is-size-4 has-text-weight-bold"><FAIcon icon="fa-solid fa-square-check" />&nbsp;Instruction Check</h3>
      <p class="is-size-6">
        To make sure you understand the instructions, please complete the quiz below. If you get all the answers
        correct, you can proceed to the expriement.
      </p>

      <div class="formstep" v-if="quizState.page === 'quiz'">
        <div class="columns">
          <div class="column is-one-third">
            <div class="formsectionexplainer">
              <h3 class="is-size-6 has-text-weight-bold">Check your understanding</h3>
              <p class="is-size-7">
                Using the information provided in the previous pages, please select the correct answer for each
                question.
              </p>
            </div>
          </div>
          <div class="column">
            <div class="box is-shadowless formbox">
              <div v-for="(question, index) in QUIZ_QUESTIONS" :key="index" class="mb-5">
                <FormKit
                  type="select"
                  :label="question.question"
                  :name="'question' + index"
                  placeholder="Select an option"
                  v-model="quizState.answers[index]"
                  :options="question.answers"
                  validation="required"
                />
              </div>
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-right">
                    <button
                      class="button is-success"
                      @click="submitQuiz"
                      :disabled="quizState.answers.some((answer) => answer === null)"
                    >
                      Submit
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
