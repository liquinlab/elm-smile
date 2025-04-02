<script setup>
import { onMounted, ref } from 'vue'
import StudyPreviewText from '@/builtins/advertisement/StudyPreviewText.vue'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const props = defineProps({
  estimated_time: {
    type: String,
    required: true,
  },
  payrate: {
    type: String,
    required: true,
  },
})

const mturkPreview = ref(true)
const launched = ref(false)
let redirectURL = ref('/#/welcome/mturk/?')
onMounted(() => {
  const urlParams = api.route.query
  let queryStr = api.route.fullPath.split('?')

  if (queryStr.length == 2) {
    redirectURL.value += queryStr[1]
  }
  api.log.debug(`${redirectURL.value}`)
  if (urlParams.assignmentId && urlParams.hitId && urlParams.workerId) {
    if (urlParams.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      api.log.debug('AMT mode, but no assignment (preview mode)')
      // supposed to show the ad here
      mturkPreview.value = true
    } else {
      api.log.debug('AMT mode, with assignment')
      mturkPreview.value = false
    }
  }
})

function clicked() {
  launched.value = !launched.value
  // open new window
  window.open(redirectURL.value, '_blank')
}
// function finish(goto) {
//     smilestore.saveData()
//     router.push(goto)
// }

// TODO: Figure out if you are in sandbox mode or not automatically
// if(sandbox) {
//     const turkSubmitTo = 'https://workersandbox.mturk.com/mturk/externalSubmit'
// } else {
//     const turkSubmitTo = 'https://www.mturk.com/mturk/externalSubmit'
// }
const turkSubmitTo = 'https://www.mturk.com/mturk/externalSubmit'
function submit() {
  api.log.debug('submitting to AMT')
}
</script>

<template>
  <div class="page">
    <StudyPreviewText :estimated_time="props.estimated_time" :payrate="payrate" v-if="mturkPreview"></StudyPreviewText>
    <div v-else>
      <h1 class="title is-3">Thanks for accepting our HIT</h1>
      <div class="submitform" v-if="launched">
        <p class="has-text-left">
          Please complete the task in the window that was launched. When you are finished you will be provided with a
          completion code which you should copy and enter here.
        </p>
        <hr />
        <FormKit type="form" submit-label="Submit to Mechanical Turk" :action="turkSubmitTo" method="post">
          <FormKit
            type="text"
            name="completioncode"
            label="Completion Code"
            v-model="api.store.local.completionCode"
            placeholder="Paste your completion code here"
            validation="required"
          />
        </FormKit>
      </div>
      <div v-else>
        <a class="button is-info" id="launch_window" @click="clicked()" target="_new">Begin Task in New Window</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.submitform {
  width: 50%;
  margin: auto;
}
</style>
