<script setup>
//import { ref, onMounted } from 'vue';

import Clipboard from 'clipboard'
import sha256 from 'crypto-js/sha256'
import Base64url from 'crypto-js/enc-base64'
import stringify from 'json-stable-stringify'

import useAPI from '@/core/composables/useAPI'
import appconfig from '@/core/config'
import { Button } from '@/uikit/components/ui/button'
const api = useAPI()

api.saveData(true) // force a data save

/// / https://app.prolific.co/submissions/complete?cc=16K4HJM1
// prolific offers another code for non-completion

// compute completion code
function computeCompletionCode() {
  // stringify the data
  const data = stringify(api.data)
  const hashDigest = Base64url.stringify(sha256(data))

  const codes = {
    withdrew: 'xx',
    completed: 'oo',
  }
  let end_code = ''
  if (api.store.browserPersisted.withdrawn) {
    end_code = codes['withdrew']
  } else if (api.store.browserPersisted.done) {
    end_code = codes['completed']
  }
  return hashDigest.slice(0, 20) + end_code // only use first 20 characters, may need to update to shortest possible code
}

const completionCode = computeCompletionCode()
api.setCompletionCode(completionCode)

// create clipboard system
const clipboard = new Clipboard('#copy_code')
clipboard.on('success', (e) => {
  api.debug(`code copied to clipboard ${e.trigger.id}`)
})

// api.debug(computeCompletionCode())
// function finish(goto) {
//     smilestore.saveData()
//     router.push(goto)
// }
</script>

<template>
  <div class="page select-none">
    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'prolific'">
      <h1 class="text-2xl font-bold mb-4">
        <FAIcon icon="fa-solid fa-square-check" />
        Thanks, let's begin the payment process!
      </h1>
      <p class="text-left pb-5 mb-4">
        Please click the button below to begin the process of payment. This will notify Prolific you successfully
        completed the task. Your work will be approved within several hours and any performance related bonuses will be
        assigned at that time. We really appreciate your time.
      </p>
      <hr class="border-gray-300 my-4" />
      <Button variant="default" as="a" :href="`https://app.prolific.co/submissions/complete?cc=${completionCode}`">
        Submit my work to Prolific
        <FAIcon icon="fa-solid fa-arrow-right" />
      </Button>
    </div>
    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'cloudresearch'">
      <h1 class="text-2xl font-bold mb-4">
        <FAIcon icon="fa-solid fa-square-check" />
        Thanks, let's begin the payment process!
      </h1>
      <p class="text-left pb-5 mb-4">
        Please copy the code displayed below (or click the button) and paste it into the Mechanical Turk window to begin
        the process of payment. Your work will be approved within several hours and any performance related bonuses will
        be assigned at that time. We really appreciate your time.
      </p>
      <hr class="border-gray-300 my-4" />
      <h1 class="text-lg font-semibold mb-2">Unique completion code:</h1>
      <div class="flex items-center gap-4 mb-4">
        <span class="text-2xl font-bold mr-5 p-2.5 border border-gray-300 rounded">{{ completionCode }}</span>
        <Button variant="default" id="copy_code" data-clipboard-target=".completioncode">
          Copy Code
          <FAIcon icon="fa-solid fa-clipboard" />
        </Button>
      </div>
    </div>
    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'mturk'">
      <h1 class="text-2xl font-bold mb-4">
        <FAIcon icon="fa-solid fa-square-check" />
        Thanks, let's begin the payment process!
      </h1>
      <p class="text-left pb-5 mb-4">
        Please verify the code displayed below is visible in the form on the Mechanical Turk website. If it is not click
        the button to copy it to your clipboard and paste it into the Mechanical Turk window to begin the process of
        payment. Your work will be approved within several hours and any performance related bonuses will be assigned at
        that time. We really appreciate your time.
      </p>
      <hr class="border-gray-300 my-4" />
      <h1 class="text-lg font-semibold mb-2">Unique completion code:</h1>
      <div class="flex items-center gap-4 mb-4">
        <span class="text-2xl font-bold mr-5 p-2.5 border border-gray-300 rounded">{{ completionCode }}</span>
        <Button variant="default" id="copy_code" data-clipboard-target=".completioncode">
          Copy Code
          <FAIcon icon="fa-solid fa-clipboard" />
        </Button>
      </div>
    </div>
    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'citizensci'">
      <h1 class="text-2xl font-bold mb-4">
        <FAIcon icon="fa-solid fa-square-check" />
        Thanks, let's begin the payment process!
      </h1>
      <p class="text-left pb-5 mb-4">This still needs to be implemented</p>
      <hr class="border-gray-300 my-4" />
      <Button
        variant="default"
        as="a"
        :href="!appconfig.anonymousMode ? 'http://gureckislab.org' : 'http://google.com'"
      >
        Submit my work
        <FAIcon icon="fa-solid fa-arrow-right" />
      </Button>
    </div>
    <div class="w-3/5 mx-auto" v-if="api.getRecruitmentService() == 'web'">
      <h1 class="text-2xl font-bold mb-4">
        <FAIcon icon="fa-solid fa-square-check" />
        Thanks for your contribution to science!
      </h1>
      <p>Your data have been successfully recorded and you can close this window or navigate to another page.</p>
    </div>
  </div>
</template>
