<script setup>
import { reactive, computed } from 'vue'
import useAPI from '@/core/composables/useAPI'

const api = useAPI()

const quizState = reactive({
  page: 'quiz',
  answers: Array(4).fill(null)
})

const QUIZ_QUESTIONS = [
  {
    id: "ex1",
    question: "Quiz Question 1",
    multiSelect: false,
    answers: ['a', 'b', 'c'],
    correctAnswer: ['a']
  },
  {
    id: "ex1",
    question: "Quiz Question 1",
    multiSelect: false,
    answers: ['a', 'b', 'c', 'd', 'e'],
    correctAnswer: ['a']
  },
  {
    id: "ex1",
    question: "Quiz Question 1",
    multiSelect: false,
    answers: ['a', 'b'],
    correctAnswer: ['a']
  },
  {
    id: "ex1",
    question: "Quiz Question 1",
    multiSelect: false,
    answers: ['a', 'b', 'c', 'd'],
    correctAnswer: ['a']
  }
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
      <div class="header-box mb-6">
        <h1 class="is-size-3 has-text-weight-bold">Instructions Quiz</h1>
        <div v-if="quizState.page === 'quiz'">
          <p class="is-size-5 has-text-weight-medium">Complete the quiz to proceed (answer a for all)</p>
        </div>
      </div>

      <div class="formstep" v-if="quizState.page === 'quiz'">
        <div class="columns">
          <div class="column is-full">
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
                      :disabled="quizState.answers.some(answer => answer === null)"
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
              <p class="mb-4">Oops! You did not get all the answers correct. Please re-read the instructions and try again.</p>
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