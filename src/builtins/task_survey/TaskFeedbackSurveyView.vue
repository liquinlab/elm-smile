<script setup>
import { reactive, computed, watch } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// const pages = api.spec().append([{ path: 'feedback_page1' }])
// api.addSpec(pages)

if (!api.globals.forminfo) {
  api.globals.forminfo = reactive({
    difficulty_rating: '', // how difficulty
    enjoyment_rating: '', // how enjoyable
    feedback: '', // general feedback
    issues: '', // any issues
  })
}

const complete = computed(
  () =>
    api.globals.forminfo.difficulty_rating !== '' &&
    api.globals.forminfo.enjoyment_rating !== '' &&
    api.globals.forminfo.feedback !== '' &&
    api.globals.forminfo.issues !== ''
)

function autofill() {
  api.globals.forminfo.difficulty_rating = '0 - Very Easy'
  api.globals.forminfo.enjoyment_rating = '6 - Very Fun'
  api.globals.forminfo.feedback = 'It was good.'
  api.globals.forminfo.issues = 'Too fun?'
}

api.setAutofill(autofill)

function finish() {
  api.recordForm('feedbackForm', api.globals.forminfo)
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <h3 class="is-size-3 has-text-weight-bold"><FAIcon icon="fa-solid fa-pencil" /> Give us feedback</h3>
      <p class="is-size-6">
        Please give us feedback about your experience with the study. Your feedback will help us improve our study and
        we appreciate your effort and thoughts.
      </p>

      <div class="formstep">
        <div class="columns">
          <div class="column is-one-third">
            <div class="formsectionexplainer">
              <h3 class="is-size-6 has-text-weight-bold">Important Note</h3>
              <p class="is-size-6">
                If this is a paid study your answers to these questions will have
                <b>no effect on your final payment</b>. We are just interested in your honest answers.
              </p>
            </div>
          </div>
          <div class="column">
            <div class="box is-shadowless formbox">
              <FormKit
                type="select"
                label="How difficult was the task over all?"
                name="difficulty"
                help="Select your rating"
                placeholder="Select an option"
                :options="[
                  '0 - Very Easy',
                  '1 - Easy',
                  '2 - Somewhat Easy',
                  '3 - Neutral',
                  '4 - Somewhat Difficult',
                  '5 - Difficult',
                  '6 - Very Difficult',
                  'I\'d rather not say',
                ]"
                v-model="api.globals.forminfo.difficulty_rating"
              />

              <FormKit
                type="select"
                label="How enjoyable/fun was the task over all?"
                name="difficulty"
                help="Select your rating"
                placeholder="Select an option"
                :options="[
                  '0 - Very Boring',
                  '1 - Boring',
                  '2 - Somewhat Boring',
                  '3 - Neutral',
                  '4 - Somewhat Fun',
                  '5 - Fun',
                  '6 - Very Fun',
                  'I\'d rather not say',
                ]"
                v-model="api.globals.forminfo.enjoyment_rating"
              />

              <FormKit
                type="textarea"
                name="instructions"
                label="Any general feedback for the study team?"
                placeholder="Please provide general thoughts, reactions, or ideas here."
                v-model="api.globals.forminfo.feedback"
              />
              <FormKit
                type="textarea"
                name="instructions"
                label="Any specific issues to report that might improve the study?"
                placeholder="Please report any specific issues you had, if any"
                v-model="api.globals.forminfo.issues"
              />
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-right">
                    <button class="button is-success" id="finish" v-if="complete" @click="finish()">
                      I'm finished
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.formstep {
  margin-top: 40px;
}

:root {
  --fk-bg-input: #fff;
  --fk-max-width-input: 100%;
}

.formbox {
  border: 1px solid #dfdfdf;
  text-align: left;
  background-color: rgb(248, 248, 248);
}

.formkit-input select {
  background-color: #fff;
}

.formkit-input input[type='range'] {
  background-color: #000;
}

.formcontent {
  width: 80%;
  margin: auto;
  margin-bottom: 40px;
  padding-bottom: 200px;
  text-align: left;
}

.formsectionexplainer {
  text-align: left;
  color: #777;
}
</style>
