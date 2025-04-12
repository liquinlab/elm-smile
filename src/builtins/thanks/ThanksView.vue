<script setup>
//import { ref, onMounted } from 'vue';

import Clipboard from 'clipboard'
import sha256 from 'crypto-js/sha256'
import Base64url from 'crypto-js/enc-base64'
import stringify from 'json-stable-stringify'

import useAPI from '@/core/composables/useAPI'
import appconfig from '@/core/config'
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
  if (api.store.local.withdrawn) {
    end_code = codes['withdrew']
  } else if (api.store.local.done) {
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
  <div class="page prevent-select">
    <h1 class="title is-3">
      <FAIcon icon="fa-solid fa-square-check" />
    </h1>

    <div class="payment" v-if="api.getRecruitmentService() == 'prolific'">
      <h1 class="title is-3">Thanks, let's begin the payment process!</h1>
      <p class="has-text-left pb-5">
        Please click the button below to begin the process of payment. This will notify Prolific you successfully
        completed the task. Your work will be approved within several hours and any performance related bonuses will be
        assigned at that time. We really appreciate your time.
      </p>
      <hr />
      <a :href="`https://app.prolific.co/submissions/complete?cc=${completionCode}`" class="button is-info"
        >Submit my work to Prolific &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </a>
    </div>
    <div class="payment" v-if="api.getRecruitmentService() == 'cloudresearch'">
      <h1 class="title is-3">Thanks, let's begin the payment process!</h1>
      <p class="has-text-left pb-5">
        Please copy the code displayed below (or click the button) and paste it into the Mechanical Turk window to begin
        the process of payment. Your work will be approved within several hours and any performance related bonuses will
        be assigned at that time. We really appreciate your time.
      </p>
      <hr />
      <h1 class="title is-5">Unique completion code:</h1>
      <span class="completioncode">{{ completionCode }}</span
      ><button class="button is-info" id="copy_code" data-clipboard-target=".completioncode">
        Copy Code &nbsp;
        <FAIcon icon="fa-solid fa-clipboard" />
      </button>
    </div>
    <div class="payment" v-if="api.getRecruitmentService() == 'mturk'">
      <h1 class="title is-3">Thanks, let's begin the payment process!</h1>
      <p class="has-text-left pb-5">
        Please verify the code displayed below is visible in the form on the Mechanical Turk website. If it is not click
        the button to copy it to your clipboard and paste it into the Mechanical Turk window to begin the process of
        payment. Your work will be approved within several hours and any performance related bonuses will be assigned at
        that time. We really appreciate your time.
      </p>
      <hr />
      <h1 class="title is-5">Unique completion code:</h1>
      <span class="completioncode">{{ completionCode }}</span
      ><button class="button is-info" id="copy_code" data-clipboard-target=".completioncode">
        Copy Code &nbsp;
        <FAIcon icon="fa-solid fa-clipboard" />
      </button>
    </div>
    <div class="payment" v-if="api.getRecruitmentService() == 'citizensci'">
      <h1 class="title is-3">Thanks, let's begin the payment process!</h1>
      <p class="has-text-left pb-5">This still needs to be implemented</p>
      <hr />
      <a :href="!appconfig.anonymousMode ? 'http://gureckislab.org' : 'http://google.com'" class="button is-info"
        >Submit my work &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </a>
    </div>
    <div class="payment" v-if="api.getRecruitmentService() == 'web'">
      <h1 class="title is-3">Thanks for your contribution to science!</h1>
      <p>Your data have been successfully recorded and you can close this window or navigate to another page.</p>
    </div>
  </div>
</template>

<style scoped>
.payment {
  width: 60%;
  margin: auto;
}

.completioncode {
  font-size: 1.5em;
  font-weight: bold;
  margin-right: 20px;
  padding: 10px;
  border: 1px solid #ccc;
}
</style>
