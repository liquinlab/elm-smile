<script setup>
import { reactive, computed } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useViewAPI()

// const pages = api.spec().append([{ id: 'feedback_page1' }])
// api.addSpec(pages)

if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    difficulty_rating: '', // how difficulty
    enjoyment_rating: '', // how enjoyable
    feedback: '', // general feedback
    issues: '', // any issues
  })
}

const complete = computed(
  () =>
    api.persist.forminfo.difficulty_rating !== '' &&
    api.persist.forminfo.enjoyment_rating !== '' &&
    api.persist.forminfo.feedback !== '' &&
    api.persist.forminfo.issues !== ''
)

function autofill() {
  api.persist.forminfo.difficulty_rating = '0 - Very Easy'
  api.persist.forminfo.enjoyment_rating = '6 - Very Fun'
  api.persist.forminfo.feedback = 'It was good.'
  api.persist.forminfo.issues = 'Too fun?'
}

api.setAutofill(autofill)

function finish() {
  api.recordForm('feedbackForm', api.persist.forminfo)
  api.saveData(true) // force a data save
  api.goNextView()
}
</script>

<template>
  <div class="page select-none">
    <div class="w-4/5 mx-auto mb-10 pb-52 text-left">
      <h3 class="text-2xl font-bold mb-4"><FAIcon icon="fa-solid fa-pencil" /> Give us feedback</h3>
      <p class="text-sm mb-8">
        Please give us feedback about your experience with the study. Your feedback will help us improve our study and
        we appreciate your effort and thoughts.
      </p>

      <div class="mt-10">
        <div class="flex gap-6">
          <div class="w-1/3">
            <div class="text-left text-gray-600">
              <h3 class="text-sm font-bold mb-2">Important Note</h3>
              <p class="text-sm">
                If this is a paid study your answers to these questions will have
                <b>no effect on your final payment</b>. We are just interested in your honest answers.
              </p>
            </div>
          </div>
          <div class="flex-1">
            <div class="border border-gray-300 text-left bg-gray-50 p-6 rounded">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  How difficult was the task over all?
                </label>
                <select
                  v-model="api.persist.forminfo.difficulty_rating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="0 - Very Easy">0 - Very Easy</option>
                  <option value="1 - Easy">1 - Easy</option>
                  <option value="2 - Somewhat Easy">2 - Somewhat Easy</option>
                  <option value="3 - Neutral">3 - Neutral</option>
                  <option value="4 - Somewhat Difficult">4 - Somewhat Difficult</option>
                  <option value="5 - Difficult">5 - Difficult</option>
                  <option value="6 - Very Difficult">6 - Very Difficult</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Select your rating</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  How enjoyable/fun was the task over all?
                </label>
                <select
                  v-model="api.persist.forminfo.enjoyment_rating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="0 - Very Boring">0 - Very Boring</option>
                  <option value="1 - Boring">1 - Boring</option>
                  <option value="2 - Somewhat Boring">2 - Somewhat Boring</option>
                  <option value="3 - Neutral">3 - Neutral</option>
                  <option value="4 - Somewhat Fun">4 - Somewhat Fun</option>
                  <option value="5 - Fun">5 - Fun</option>
                  <option value="6 - Very Fun">6 - Very Fun</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Select your rating</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Any general feedback for the study team?
                </label>
                <textarea
                  v-model="api.persist.forminfo.feedback"
                  placeholder="Please provide general thoughts, reactions, or ideas here."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  rows="4"
                ></textarea>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Any specific issues to report that might improve the study?
                </label>
                <textarea
                  v-model="api.persist.forminfo.issues"
                  placeholder="Please report any specific issues you had, if any"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  rows="4"
                ></textarea>
              </div>

              <hr class="border-gray-300 my-6" />

              <div class="flex justify-end">
                <Button variant="default" v-if="complete" @click="finish()"> I'm finished </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
