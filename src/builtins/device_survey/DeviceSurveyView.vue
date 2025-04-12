<script setup>
import { reactive, computed } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

const pages = api.spec().append([{ path: 'device_page1' }, { path: 'device_page2' }])
api.addSpec(pages)

if (!api.globals.forminfo) {
  api.globals.forminfo = reactive({
    device_type: '', // type of device (e.g., desktop, laptop, tablet, phone)
    connection: '', // type of internet connection (e.g., wifi, ethernet, cellular)
    connection_quality: '', // self-reported connection quality
    browser: '', // self-reported browser
    pointer: '', // self-reported pointing device (mouse, trackpad, touchscreen)
    assistive_technology: '', // self-reported assistive technology
    tools: '', // self-report of tools
  })
}

const page_one_complete = computed(
  () =>
    api.globals.forminfo.device_type !== '' &&
    api.globals.forminfo.connection !== '' &&
    api.globals.forminfo.connection_quality !== '' &&
    api.globals.forminfo.browser !== ''
)

const page_two_complete = computed(
  () =>
    api.globals.forminfo.pointer !== '' &&
    api.globals.forminfo.assistive_technology !== '' &&
    api.globals.forminfo.tools !== ''
)

function autofill() {
  api.globals.forminfo.device_type = 'Desktop Computer'
  api.globals.forminfo.connection = 'Wifi'
  api.globals.forminfo.connection_quality = 'Fast'
  api.globals.forminfo.browser = 'ARC'
  api.globals.forminfo.pointer = 'Mouse'
  api.globals.forminfo.assistive_technology = 'No'
  api.globals.forminfo.tools = 'No'
}

api.setAutofill(autofill)

function finish() {
  api.recordForm('deviceForm', api.globals.forminfo)
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <h3 class="is-size-3 has-text-weight-bold"><FAIcon icon="fa-solid fa-desktop" /> Computer/Device Information</h3>
      <p class="is-size-6">
        We request some basic information about the computer you are using right now. We also can use this information
        to improve the quality of our experiments in the future.
      </p>

      <div class="formstep" v-if="api.paths === 'device_page1'">
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
                label="What best describes the computer you are using right now?"
                name="connection"
                help="Enter your computer type (choose the best match)"
                placeholder="Select an option"
                :options="[
                  'Laptop Computer',
                  'Desktop Computer',
                  'iPad/Tablet',
                  'Smartphone',
                  'Television',
                  'Other',
                  'I\'m not sure',
                  'I\'d rather not say',
                ]"
                v-model="api.globals.forminfo.device_type"
              />
              <FormKit
                type="select"
                label="What type of Internet connection are you using right now?"
                name="connection"
                help="Enter your internet connection type"
                placeholder="Select an option"
                :options="[
                  'Ethernet',
                  'Wifi',
                  'Cellular (5G)',
                  'Cellular (4G/LTE)',
                  'Cellular (3G)',
                  'DSL',
                  'Dialup Modem',
                  'Other',
                  'I\'m not sure',
                  'I\'d rather not say',
                ]"
                v-model="api.globals.forminfo.connection"
              />
              <FormKit
                type="select"
                label="How would you rate you Internet connection quality today?"
                name="browser"
                help="How would you rate your Internet connection"
                placeholder="Select an option"
                :options="[
                  'Fast',
                  'Moderate',
                  'Slow but reliable',
                  'Very slow, unreliable',
                  'I\'m not sure',
                  'I\'d rather not say',
                ]"
                v-model="api.globals.forminfo.connection_quality"
              />
              <FormKit
                type="select"
                label="What web browser are you using?"
                name="connection"
                help="Enter your internet browser type"
                placeholder="Select an option"
                :options="[
                  'Safari (Mac)',
                  'Chrome',
                  'Firefox',
                  'Opera',
                  'Microsoft Edge',
                  'Microsoft Internet Explorer',
                  'UC Browser',
                  'Samsung Internet',
                  'ARC',
                  'Chromium',
                  'Other',
                  'I\'m not sure',
                  'I\'d rather not say',
                ]"
                v-model="api.globals.forminfo.browser"
              />
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-right">
                    <button class="button is-warning" id="finish" v-if="page_one_complete" @click="api.goNextStep()">
                      Continue &nbsp;
                      <FAIcon icon="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="formstep" v-else-if="api.paths === 'device_page2'">
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
                label="What best descries how you moved the cursor, clicked, or scrolled things during this experiment?"
                name="connection"
                help="Enter your input type"
                placeholder="Select an option"
                :options="[
                  'Mouse',
                  'Trackpad',
                  'Scrollwheel',
                  'Touchscreen/Finger',
                  'Trackpoint/pointing stick',
                  'Stylus/Pen/Pencil',
                  'Keyboard Only',
                  'Game Controller',
                  'Other',
                  'I\'m not sure',
                  'I\'d rather not say',
                ]"
                v-model="api.globals.forminfo.pointer"
              />
              <FormKit
                type="select"
                label="Are you using any assistive technologies?"
                name="browser"
                help="Examples include screen readers, screen magnifiers, or voice input systems."
                placeholder="Select an option"
                :options="['No', 'Yes', 'I\'m not sure', 'I\'d rather not say']"
                v-model="api.globals.forminfo.assistive_technology"
              />
              <FormKit
                type="select"
                label="Did you use any tools to help you complete this experiment?"
                name="browser"
                help="Examples include browser extensions that help you fill forms, enter text, or navigate the web or copying answers from AI/Large Language Models."
                placeholder="Select an option"
                :options="['No', 'Yes', 'I\'m not sure', 'I\'d rather not say']"
                v-model="api.globals.forminfo.tools"
              />
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-left">
                    <button class="button is-warning" id="finish" @click="api.goPrevStep()">
                      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; Previous
                    </button>
                  </div>
                </div>
                <div class="column">
                  <div class="has-text-right">
                    <button class="button is-success" id="finish" v-if="page_two_complete" @click="finish()">
                      I'm done!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="formstep" v-else>
        <article class="message is-danger">
          <div class="message-header">
            <p>Error</p>
            <button class="delete" aria-label="delete"></button>
          </div>
          <div class="message-body">
            Error, you shouldn't have been able to get this far! This happened because the stepper for this route has
            been incremented too many times. There's no problem so long as your code doesn't allow this in live mode.
          </div>
        </article>
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
