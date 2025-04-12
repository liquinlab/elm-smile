<script setup>
import { shallowRef, ref, computed } from 'vue'

import CaptchaInstructionsText_01 from '@/builtins/captcha/CaptchaInstructionsText_01.vue'
import CaptchaInstructionsText_02 from '@/builtins/captcha/CaptchaInstructionsText_02.vue'
import CaptchaTrialImageCategorization from '@/builtins/captcha/CaptchaTrialImageCategorization.vue'
import CaptchaTrialMaze from '@/builtins/captcha/CaptchaTrialMaze.vue'
import CaptchaTrialTextComprehension from '@/builtins/captcha/CaptchaTrialTextComprehension.vue'
import CaptchaTrialStroop from '@/builtins/captcha/CaptchaTrialStroop.vue'
import CaptchaTrialRotateImage from '@/builtins/captcha/CaptchaTrialRotateImage.vue'
import CaptchaButtonPress from '@/builtins/captcha/CaptchaButtonPress.vue'
import CaptchaShyDot from '@/builtins/captcha/CaptchaShyDot.vue'

// give feedback

// rotate image -- good but need to scamble file names

// in progress
// move slowly towards and object in order to sneak up on it but don't say that in instructions (let them figure it out)
// maze
// don't press button
// text comprehension

// planned
// listen to the music and tap on the beat
// intuitive physics - pat which looks like more natural
// mental rotation - rotate the image to match the other image

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

//  need to set up not just the pages but the trials here with configuration inputs
// for the image categorization and rotate image task need a bunch of images
// possibly altered so that there is lots of substructure to it

// { component: CaptchaTrialTextComprehension, props: { timed_task: false }, data: [] },
// { component: CaptchaShyDot, props: { timed_task: false }, data: [] },
// { component: CaptchaInstructionsText_02, props: {}, data: [] },
// //{ component: CaptchaTrialImageCategorization, props: {}, data: [] },
// { component: CaptchaTrialMaze, props: { timed_task: true }, data: [] },
//
// { component: CaptchaButtonPress, props: {}, data: [] },
// { component: CaptchaRotateImage, props: {}, data: [] },
// { component: CaptchaTrialMaze, props: { timed_task: true }, data: [] },
// { component: CaptchaRotateImage, props: {}, data: [] },
// { component: CaptchaButtonPress, props: {}, data: [] },
// { component: CaptchaRotateImage, props: {}, data: [] },
// { component: CaptchaTrialTextComprehension, props: { timed_task: false }, data: [] },
// { component: CaptchaRotateImage, props: {}, data: [] },
// { component: CaptchaTrialMaze, props: { timed_task: true }, data: [] },

// a dynamic loader for different trial types which is randomized?
// each trial type is a simple game that just stores the data from the subject
// games include tests of 10 possible games

// 1 - perceptual motor behavior like Operation
// 2 - human like categorization (quickly place in piles)
// 3 - text comprehension
// 4 - foraging in semantic memory
// 5 - human brain should show stroop interference
// 6 -

const trials = api.spec().append([
  { path: 'instructions_01', component: CaptchaInstructionsText_01, props: { adjective: '' } },
  {
    path: 'rotate_image',
    component: CaptchaTrialRotateImage,
    props: { timed_task: true, max_time: 50000 },
  },
  { path: 'maze', component: CaptchaTrialMaze, props: { timed_task: false } },
])
api.addSpec(trials)

// const currentTab = computed(() => {
//   return stepppages[step.index()]
// })
// captcha steps

function next_trial() {
  if (api.stepIndex >= api.nSteps) {
    api.goNextView()
  } else {
    api.saveData() // force a save
    api.goNextStep()
  }
}
</script>

<template>
  <div class="page">
    <div class="instructions" v-if="api.paths == 'EOS'">
      <div class="formstep">
        <article class="message is-danger">
          <div class="message-header">
            <p>Error</p>
            {{ api.index }}
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

    <component
      :is="api.stepData.component"
      v-bind="api.stepData.props"
      @next-page-captcha="next_trial()"
      :key="api.index"
      v-else
    >
    </component>
  </div>
</template>

<style scoped>
.instructions {
  width: 60%;
  margin: auto;
}
</style>
