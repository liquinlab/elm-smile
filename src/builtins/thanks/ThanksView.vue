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
  <div class="w-full select-none mx-auto py-10">
    <div class="w-4/5 mx-auto text-left">
      <div v-if="api.getRecruitmentService() == 'prolific'">
        <h1 class="text-3xl font-bold mb-4">
          <FAIcon icon="fa-solid fa-square-check" />&nbsp;Thanks, let's begin the payment process!
        </h1>
        <p class="text-lg mb-8">
          Please click the button below to begin the process of payment. This will notify Prolific you successfully
          completed the task. Your work will be approved within several hours and any performance related bonuses will
          be assigned at that time. We really appreciate your time.
        </p>
        <div class="mt-10">
          <div class="flex gap-6">
            <div class="w-1/3">
              <div class="text-left text-muted-foreground">
                <h3 class="text-lg font-bold mb-2">Payment Process</h3>
                <p class="text-sm text-muted-foreground">
                  Click the button to complete your submission and receive payment through Prolific.
                </p>
              </div>
            </div>
            <div class="flex-1">
              <div class="border border-border text-left bg-muted p-6 rounded-lg">
                <Button
                  variant="default"
                  as="a"
                  :href="`https://app.prolific.co/submissions/complete?cc=${completionCode}`"
                >
                  Submit my work to Prolific
                  <FAIcon icon="fa-solid fa-arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="api.getRecruitmentService() == 'cloudresearch'">
        <h1 class="text-3xl font-bold mb-4">
          <FAIcon icon="fa-solid fa-square-check" />&nbsp;Thanks, let's begin the payment process!
        </h1>
        <p class="text-lg mb-8">
          Please copy the code displayed below (or click the button) and paste it into the Mechanical Turk window to
          begin the process of payment. Your work will be approved within several hours and any performance related
          bonuses will be assigned at that time. We really appreciate your time.
        </p>
        <div class="mt-10">
          <div class="flex gap-6">
            <div class="w-1/3">
              <div class="text-left text-muted-foreground">
                <h3 class="text-lg font-bold mb-2">Completion Code</h3>
                <p class="text-md text-muted-foreground">
                  Copy this unique code and paste it into the Mechanical Turk submission form.
                </p>
              </div>
            </div>
            <div class="flex-1">
              <div class="border border-border text-left bg-muted p-6 rounded-lg">
                <h3 class="text-lg font-semibold mb-4 text-foreground">Unique completion code:</h3>
                <div class="flex items-center gap-4 mb-4">
                  <span class="text-2xl font-bold p-3 border border-border rounded bg-background text-foreground">{{
                    completionCode
                  }}</span>
                  <Button variant="default" id="copy_code" data-clipboard-target=".completioncode">
                    Copy Code
                    <FAIcon icon="fa-solid fa-clipboard" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="api.getRecruitmentService() == 'mturk'">
        <h1 class="text-3xl font-bold mb-4">
          <FAIcon icon="fa-solid fa-square-check" />&nbsp;Thanks, let's begin the payment process!
        </h1>
        <p class="text-lg mb-8">
          Please verify the code displayed below is visible in the form on the Mechanical Turk website. If it is not
          click the button to copy it to your clipboard and paste it into the Mechanical Turk window to begin the
          process of payment. Your work will be approved within several hours and any performance related bonuses will
          be assigned at that time. We really appreciate your time.
        </p>
        <div class="mt-10">
          <div class="flex gap-6">
            <div class="w-1/3">
              <div class="text-left text-muted-foreground">
                <h3 class="text-lg font-bold mb-2">Completion Code</h3>
                <p class="text-md text-muted-foreground">
                  Verify this code appears in your Mechanical Turk submission form, or copy it manually.
                </p>
              </div>
            </div>
            <div class="flex-1">
              <div class="border border-border text-left bg-muted p-6 rounded-lg">
                <h3 class="text-lg font-semibold mb-4 text-foreground">Unique completion code:</h3>
                <div class="flex items-center gap-4 mb-4">
                  <span class="text-2xl font-bold p-3 border border-border rounded bg-background text-foreground">{{
                    completionCode
                  }}</span>
                  <Button variant="default" id="copy_code" data-clipboard-target=".completioncode">
                    Copy Code
                    <FAIcon icon="fa-solid fa-clipboard" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="api.getRecruitmentService() == 'citizensci'">
        <h1 class="text-3xl font-bold mb-4">
          <FAIcon icon="fa-solid fa-square-check" />&nbsp;Thanks, let's begin the payment process!
        </h1>
        <p class="text-lg mb-8">This still needs to be implemented</p>
        <div class="mt-10">
          <div class="flex gap-6">
            <div class="w-1/3">
              <div class="text-left text-muted-foreground">
                <h3 class="text-lg font-bold mb-2">Submission</h3>
                <p class="text-md text-muted-foreground">Click the button to complete your submission.</p>
              </div>
            </div>
            <div class="flex-1">
              <div class="border border-border text-left bg-muted p-6 rounded-lg">
                <Button
                  variant="default"
                  as="a"
                  :href="!appconfig.anonymousMode ? 'http://gureckislab.org' : 'http://google.com'"
                >
                  Submit my work
                  <FAIcon icon="fa-solid fa-arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="api.getRecruitmentService() == 'web'">
        <h1 class="text-3xl font-bold mb-4">
          <FAIcon icon="fa-solid fa-square-check" />&nbsp;Thanks for your contribution to science!
        </h1>
        <p class="text-lg mb-8">
          Your data have been successfully recorded and you can close this window or navigate to another page.
        </p>
        <div class="mt-10">
          <div class="flex gap-6">
            <div class="w-1/3">
              <div class="text-left text-muted-foreground">
                <h3 class="text-lg font-bold mb-2">Study Complete</h3>
                <p class="text-md text-muted-foreground">
                  Thank you for participating in our research study. Your contribution helps advance scientific
                  knowledge.
                </p>
              </div>
            </div>
            <div class="flex-1">
              <div class="border border-border text-left bg-muted p-6 rounded-lg">
                <p class="text-foreground">You may now safely close this browser window.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
