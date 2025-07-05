<script setup>
import { onMounted, ref } from 'vue'
import StudyPreviewText from '@/builtins/advertisement/StudyPreviewText.vue'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
import { Button } from '@/uikit/components/ui/button'
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
  <div class="mt-20 w-4/5 mx-auto">
    <StudyPreviewText :estimated_time="props.estimated_time" :payrate="payrate" v-if="mturkPreview"></StudyPreviewText>
    <div v-else>
      <h1 class="text-2xl font-bold mb-4">Thanks for accepting our HIT</h1>
      <div class="w-1/2 mx-auto" v-if="launched">
        <p class="text-left mb-4">
          Please complete the task in the window that was launched. When you are finished you will be provided with a
          completion code which you should copy and enter here.
        </p>
        <hr class="border-gray-300 my-4" />
        <FormKit type="form" submit-label="Submit to Mechanical Turk" :action="turkSubmitTo" method="post">
          <FormKit
            type="text"
            name="completioncode"
            label="Completion Code"
            v-model="api.store.browserPersisted.completionCode"
            placeholder="Paste your completion code here"
            validation="required"
          />
        </FormKit>
      </div>
      <div v-else>
        <Button variant="default" @click="clicked()" target="_new"> Begin Task in New Window </Button>
      </div>
    </div>
  </div>
</template>
