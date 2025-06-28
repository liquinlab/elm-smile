<script setup>
import { reactive, computed } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useViewAPI()

api.steps.append([{ id: 'device_page1' }, { id: 'device_page2' }])

// persists the form info in local storage, otherwise initialize
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
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
    api.persist.forminfo.device_type !== '' &&
    api.persist.forminfo.connection !== '' &&
    api.persist.forminfo.connection_quality !== '' &&
    api.persist.forminfo.browser !== ''
)

const page_two_complete = computed(
  () =>
    api.persist.forminfo.pointer !== '' &&
    api.persist.forminfo.assistive_technology !== '' &&
    api.persist.forminfo.tools !== ''
)

function autofill() {
  api.persist.forminfo.device_type = 'Desktop Computer'
  api.persist.forminfo.connection = 'Wifi'
  api.persist.forminfo.connection_quality = 'Fast'
  api.persist.forminfo.browser = 'ARC'
  api.persist.forminfo.pointer = 'Mouse'
  api.persist.forminfo.assistive_technology = 'No'
  api.persist.forminfo.tools = 'No'
}

api.setAutofill(autofill)

function finish() {
  api.recordForm('deviceForm', api.persist.forminfo)
  api.goNextView()
}
</script>

<template>
  <div class="page select-none">
    <div class="w-4/5 mx-auto mb-10 pb-52 text-left">
      <h3 class="text-2xl font-bold mb-4"><FAIcon icon="fa-solid fa-desktop" /> Computer/Device Information</h3>
      <p class="text-sm mb-8">
        We request some basic information about the computer you are using right now. We also can use this information
        to improve the quality of our experiments in the future.
      </p>

      <div class="mt-10" v-if="api.pathString === 'device_page1'">
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
                  What best describes the computer you are using right now?
                </label>
                <select
                  v-model="api.persist.forminfo.device_type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Laptop Computer">Laptop Computer</option>
                  <option value="Desktop Computer">Desktop Computer</option>
                  <option value="iPad/Tablet">iPad/Tablet</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Television">Television</option>
                  <option value="Other">Other</option>
                  <option value="I'm not sure">I'm not sure</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Enter your computer type (choose the best match)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  What type of Internet connection are you using right now?
                </label>
                <select
                  v-model="api.persist.forminfo.connection"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Ethernet">Ethernet</option>
                  <option value="Wifi">Wifi</option>
                  <option value="Cellular (5G)">Cellular (5G)</option>
                  <option value="Cellular (4G/LTE)">Cellular (4G/LTE)</option>
                  <option value="Cellular (3G)">Cellular (3G)</option>
                  <option value="DSL">DSL</option>
                  <option value="Dialup Modem">Dialup Modem</option>
                  <option value="Other">Other</option>
                  <option value="I'm not sure">I'm not sure</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Enter your internet connection type</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate you Internet connection quality today?
                </label>
                <select
                  v-model="api.persist.forminfo.connection_quality"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Fast">Fast</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Slow but reliable">Slow but reliable</option>
                  <option value="Very slow, unreliable">Very slow, unreliable</option>
                  <option value="I'm not sure">I'm not sure</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">How would you rate your Internet connection</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> What web browser are you using? </label>
                <select
                  v-model="api.persist.forminfo.browser"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Safari (Mac)">Safari (Mac)</option>
                  <option value="Chrome">Chrome</option>
                  <option value="Firefox">Firefox</option>
                  <option value="Opera">Opera</option>
                  <option value="Microsoft Edge">Microsoft Edge</option>
                  <option value="Microsoft Internet Explorer">Microsoft Internet Explorer</option>
                  <option value="UC Browser">UC Browser</option>
                  <option value="Samsung Internet">Samsung Internet</option>
                  <option value="ARC">ARC</option>
                  <option value="Chromium">Chromium</option>
                  <option value="Other">Other</option>
                  <option value="I'm not sure">I'm not sure</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Enter your internet browser type</p>
              </div>

              <hr class="border-gray-300 my-6" />

              <div class="flex justify-end">
                <Button variant="outline" v-if="page_one_complete" @click="api.goNextStep()">
                  Continue
                  <FAIcon icon="fa-solid fa-arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10" v-else-if="api.pathString === 'device_page2'">
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
                  What best descries how you moved the cursor, clicked, or scrolled things during this experiment?
                </label>
                <select
                  v-model="api.persist.forminfo.pointer"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Trackpad">Trackpad</option>
                  <option value="Scrollwheel">Scrollwheel</option>
                  <option value="Touchscreen/Finger">Touchscreen/Finger</option>
                  <option value="Trackpoint/pointing stick">Trackpoint/pointing stick</option>
                  <option value="Stylus/Pen/Pencil">Stylus/Pen/Pencil</option>
                  <option value="Keyboard Only">Keyboard Only</option>
                  <option value="Game Controller">Game Controller</option>
                  <option value="Other">Other</option>
                  <option value="I'm not sure">I'm not sure</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Enter your input type</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Are you using any assistive technologies?
                </label>
                <select
                  v-model="api.persist.forminfo.assistive_technology"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="I'm not sure">I'm not sure</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Examples include screen readers, screen magnifiers, or voice input systems.
                </p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Did you use any tools to help you complete this experiment?
                </label>
                <select
                  v-model="api.persist.forminfo.tools"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="I'm not sure">I'm not sure</option>
                  <option value="I'd rather not say">I'd rather not say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Examples include browser extensions that help you fill forms, enter text, or navigate the web or
                  copying answers from AI/Large Language Models.
                </p>
              </div>

              <hr class="border-gray-300 my-6" />

              <div class="flex justify-between">
                <Button variant="outline" @click="api.goPrevStep()">
                  <FAIcon icon="fa-solid fa-arrow-left" />
                  Previous
                </Button>
                <Button variant="default" v-if="page_two_complete" @click="finish()"> I'm done! </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
