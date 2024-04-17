<script setup>
import { shallowRef, ref, computed } from 'vue'

import CaptchaInstructionsText_01 from '@/components/captcha/CaptchaInstructionsText_01.vue'
import CaptchaInstructionsText_02 from '@/components/captcha/CaptchaInstructionsText_02.vue'
import CaptchaTrialImageCategorization from '@/components/captcha/CaptchaTrialImageCategorization.vue'
import CaptchaTrialMotorControl from '@/components/captcha/CaptchaTrialMotorControl.vue'
import CaptchaTrialTextComprehension from '@/components/captcha/CaptchaTrialTextComprehension.vue'
import CaptchaTrialStroop from '@/components/captcha/CaptchaTrialStroop.vue'
import CaptchaRotateImage from '@/components/captcha/CaptchaRotateImage.vue'

// import and initalize smile API
import useSmileAPI from '@/core/composables/smileapi'
const api = useSmileAPI()

//  need to set up not just the pages but the trials here with configuration inputs
// for the image categorization and rotate image task need a bunch of images
// possibly altered so that there is lots of substructure to it

const pages = [
  { component: CaptchaInstructionsText_01, props: { adjective: 'wonderful' }, data: [] },
  { component: CaptchaTrialTextComprehension, props: {}, data: [] },
  { component: CaptchaInstructionsText_02, props: {}, data: [] },
  { component: CaptchaTrialImageCategorization, props: {}, data: [] },
  { component: CaptchaTrialMotorControl, props: {}, data: [] },
  { component: CaptchaRotateImage, props: {}, data: [] },
  { component: CaptchaTrialMotorControl, props: {}, data: [] },
]

const currentTab = computed(() => {
  return pages[api.getCurrentTrial()]
})
// captcha steps

// a dynamic loader for different trial types which is randomized?
// each trial type is a simple game that just stores the data from the subject
// games include tests of 10 possible games

// 1 - perceptual motor behavior like Operation
// 2 - human like categorization (quickly place in piles)
// 3 - text comprehension
// 4 - foraging in semantic memory
// 5 - human brain should show stroop interference
// 6 -

const { nextTrial } = api.useTrialStepper(pages, api.currentRouteName(), () => {
  finalize()
})

function finalize() {
  // sort out what data you are putting in the smile store here?
  console.log('finished, so will save data and stuff')
}

function next_trial() {
  if (api.getCurrentTrial() >= pages.length - 1) {
    //api.resetPageTracker() // you coudl reset when you leavr but why?
    finish()
  } else {
    ///api.incrementTrial()
    nextTrial()
  }
}

function finish() {
  // smilestore.saveData()
  api.stepNextRoute()
}
</script>

<template>
  <div class="page">
    <div class="instructions" v-if="api.getCurrentTrial() >= pages.length">
      <div class="formstep">
        <article class="message is-danger">
          <div class="message-header">
            <p>Error</p>
            <button class="delete" aria-label="delete"></button>
          </div>
          <div class="message-body">
            Error, you shouldn't have been able to get this far! This happened because the pageTracker for this route
            has been incremented too many times. There's no problem so long as your code doesn't allow this in live
            mode.
          </div>
        </article>
      </div>
    </div>

    <!-- Component changes when currentTab changes -->
    <component :is="currentTab.component" v-bind="currentTab.props" @next-page-captcha="next_trial()" v-else>
    </component>
  </div>
</template>

<style scoped>
.instructions {
  width: 60%;
  margin: auto;
}
</style>
