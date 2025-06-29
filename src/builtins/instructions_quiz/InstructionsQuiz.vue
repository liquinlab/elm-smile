<script setup>
import { reactive, computed, ref, onMounted, nextTick } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
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

  const sections = api.steps.append([{ id: 'pages' }, { id: 'feedback' }])

  sections[0].append(qs)

  sections[1].append([{ id: 'success' }, { id: 'retry' }]) // add to additional pages

  if (!api.persist.isDefined('attempts')) {
    api.persist.attempts = 1
  }
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
  console.log('api.sm', api.steps)
  updateQuestionsInState(api.steps)
}

api.setAutofill(autofill)

const quizCorrect = computed(() => {
  // Get all questions from all pages using queryStepData with a path filter
  const allQuestions = api.queryStepData('pages*').flatMap((page) => page.questions || [])

  return allQuestions.every((question) => {
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
})

const currentPageComplete = computed(() => {
  if (!api.stepData?.questions || !Array.isArray(api.stepData.questions)) {
    return false
  }
  return api.stepData.questions.every((question) => {
    if ('answer' in question) {
      // For multiselect, ensure at least one option is selected
      if (question.multiSelect) {
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
    questions: api.queryStepData('pages*'), // Update to use randomized questions
    persist: api.persist,
  })
  if (quizCorrect.value) {
    api.goToStep('feedback/success')
  } else {
    api.goToStep('feedback/retry')
  }
}

function returnInstructions() {
  api.goFirstStep() // reset the quiz
  api.clear() // don't remember across reloads
  api.persist.attempts = api.persist.attempts + 1 // increment attempts
  api.goToView(props.returnTo) // go back to instructions
}

function finish() {
  api.goNextView()
}

init()
</script>

<template>
  <div class="w-full select-none mx-auto py-10">
    <div class="w-4/5 mx-auto text-left">
      <!-- Replace the two quiz page sections with this single dynamic one -->
      <div class="mt-10" v-if="api.stepIndex < qs.length && /^pages\/pg\d+$/.test(api.pathString)">
        <div class="mb-10">
          <h3 class="text-3xl font-bold mb-4">
            <FAIcon icon="fa-solid fa-square-check" />&nbsp;Did we explain things clearly?
          </h3>
          <p class="text-lg mb-8">
            Using the information provided in the previous pages, please select the correct answer for each question. Do
            your best! If anything is unclear you can review the instructions again after you submit your response.
          </p>
        </div>
        <div class="flex gap-6">
          <div class="w-1/3">
            <div class="text-left text-muted-foreground">
              <h3 class="text-lg font-bold mb-2">Test your understanding</h3>
              <p class="text-md text-muted-foreground">You must answer all the questions in order to move on.</p>
            </div>
          </div>
          <div class="flex-1">
            <div class="border border-border text-left bg-muted p-6 rounded-lg">
              <div v-for="(question, index) in api.stepData.questions" :key="question.id" class="mb-3">
                <label class="block text-md font-medium text-foreground mb-2">
                  {{ question.question }}
                </label>

                <!-- Multi-select checkbox -->
                <div v-if="question.multiSelect" class="space-y-3">
                  <div
                    v-for="(answer, answerIndex) in question.answers"
                    :key="answerIndex"
                    class="flex items-center space-x-2"
                  >
                    <Checkbox
                      :id="`${question.id}-${answerIndex}`"
                      :checked="
                        Array.isArray(api.stepData.questions[index].answer) &&
                        api.stepData.questions[index].answer.includes(answer)
                      "
                      @update:checked="
                        (checked) => {
                          // Initialize answer as array if it doesn't exist or isn't an array
                          if (
                            !api.stepData.questions[index].answer ||
                            !Array.isArray(api.stepData.questions[index].answer)
                          ) {
                            api.stepData.questions[index].answer = []
                          }

                          // Create a new array to ensure reactivity
                          const currentAnswers = [...api.stepData.questions[index].answer]

                          if (checked) {
                            if (!currentAnswers.includes(answer)) {
                              currentAnswers.push(answer)
                            }
                          } else {
                            const answerIndex = currentAnswers.indexOf(answer)
                            if (answerIndex > -1) {
                              currentAnswers.splice(answerIndex, 1)
                            }
                          }

                          // Update the reactive data
                          api.stepData.questions[index].answer = currentAnswers
                        }
                      "
                    />
                    <label :for="`${question.id}-${answerIndex}`" class="text-sm text-foreground cursor-pointer">
                      {{ answer }}
                    </label>
                  </div>
                </div>

                <!-- Single select dropdown -->
                <Select v-else v-model="api.stepData.questions[index].answer">
                  <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="answer in question.answers" :key="answer" :value="answer">
                      {{ answer }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <hr class="border-border my-6" />

              <div class="flex justify-between">
                <Button variant="outline" v-if="api.stepIndex >= 1" @click="api.goPrevStep()">
                  <FAIcon icon="fa-solid fa-arrow-left" />
                  Previous page
                </Button>
                <div v-else></div>
                <Button
                  :variant="api.isLastBlockStep() ? 'default' : 'outline'"
                  :disabled="!currentPageComplete"
                  @click="api.isLastBlockStep() ? submitQuiz() : api.goNextStep()"
                >
                  {{ api.isLastBlockStep() ? 'Submit' : 'Next page' }}
                  <FAIcon v-if="!api.isLastBlockStep()" icon="fa-solid fa-arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10" v-else-if="api.pathString === 'feedback/success'">
        <div class="text-center">
          <h3 class="text-3xl font-bold mb-4"><FAIcon icon="fa-solid fa-square-check" />&nbsp;Congrats! You passed.</h3>
          <p class="text-lg mb-6">Click here to begin the next phase of the experiment.</p>
          <Button variant="default" @click="finish">Let's begin.</Button>
        </div>
      </div>

      <div class="mt-10" v-else-if="api.pathString === 'feedback/retry'">
        <div class="text-center">
          <h3 class="text-3xl font-bold mb-4">
            <FAIcon icon="fa-solid fa-square-check" />&nbsp;Sorry! You did not get all the answers correct.
          </h3>
          <p class="text-lg mb-6">Please re-read the instructions and try again.</p>
          <Button variant="outline" @click="returnInstructions">Back to Instructions</Button>
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
