<script setup>
//import { ref, onMounted } from 'vue';

import Clipboard from 'clipboard'
import sha256 from 'crypto-js/sha256'
import Base64url from 'crypto-js/enc-base64'
import stringify from 'json-stable-stringify'

import useAPI from '@/core/composables/useAPI'
import appconfig from '@/core/config'
import { Button } from '@/uikit/components/ui/button'
import { Input } from '@/uikit/components/ui/input'
import { TitleTwoCol } from '@/uikit/layouts'

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
import { onMounted } from 'vue'

onMounted(() => {
  const clipboard = new Clipboard('[data-clipboard-target]')
  clipboard.on('success', (e) => {
    api.log.debug(`code copied to clipboard ${e.trigger.id}`)
  })
})

// api.debug(computeCompletionCode())
// function finish(goto) {
//     smilestore.saveData()
//     router.push(goto)
// }
</script>

<template>
  <div class="w-full mx-auto py-10">
    <div class="w-4/5 mx-auto text-left">
      <div v-if="api.getRecruitmentService() == 'prolific'">
        <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
          <template #title>
            <h1 class="text-3xl font-bold mb-4">
              <i-fa6-solid-square-check class="inline mr-2" />&nbsp;Thanks, let's begin the payment process!
            </h1>
            <p class="text-lg mb-8">
              Please click the button below to begin the process of payment. This will notify Prolific you successfully
              completed the task. Your work will be approved within several hours and any performance related bonuses
              will be assigned at that time. We really appreciate your time.
            </p>
          </template>
          <template #left>
            <div class="text-left text-muted-foreground">
              <h3 class="text-lg font-bold mb-2">Payment Process</h3>
              <p class="text-sm text-muted-foreground">
                Click the button to complete your submission and receive payment through Prolific.
              </p>
            </div>
          </template>
          <template #right>
            <div class="border border-border text-left bg-muted p-6 rounded-lg">
              <Button
                variant="default"
                as="a"
                :href="`https://app.prolific.co/submissions/complete?cc=${completionCode}`"
              >
                Submit my work to Prolific
                <i-fa6-solid-arrow-right />
              </Button>
            </div>
          </template>
        </TitleTwoCol>
      </div>

      <div v-if="api.getRecruitmentService() == 'cloudresearch'">
        <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
          <template #title>
            <h1 class="text-3xl font-bold mb-4">
              <i-fa6-solid-square-check class="inline mr-2" />&nbsp;Thanks, let's begin the payment process!
            </h1>
            <p class="text-lg mb-8">
              Please copy the code displayed below (or click the button) and paste it into the Mechanical Turk window to
              begin the process of payment. Your work will be approved within several hours and any performance related
              bonuses will be assigned at that time. We really appreciate your time.
            </p>
          </template>
          <template #left>
            <div class="text-left text-muted-foreground">
              <h3 class="text-lg font-bold mb-2">Completion Code</h3>
              <p class="text-sm text-muted-foreground">
                Copy this unique code and paste it into the Mechanical Turk submission form.
              </p>
            </div>
          </template>
          <template #right>
            <div class="border border-border text-left bg-muted p-6 rounded-lg">
              <h3 class="text-lg font-semibold mb-4 text-foreground">Unique completion code:</h3>
              <div class="flex items-center gap-4 mb-4">
                <Input v-model="completionCode" readonly class="text-3xl completioncode-cloudresearch" />
                <Button variant="default" data-clipboard-target=".completioncode-cloudresearch">
                  Copy Code
                  <i-fa6-solid-clipboard />
                </Button>
              </div>
            </div>
          </template>
        </TitleTwoCol>
      </div>

      <div v-if="api.getRecruitmentService() == 'mturk'">
        <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
          <template #title>
            <h1 class="text-3xl font-bold mb-4">
              <i-fa6-solid-square-check class="inline mr-2" />&nbsp;Thanks, let's begin the payment process!
            </h1>
            <p class="text-lg mb-8">
              Please verify the code displayed below is visible in the form on the Mechanical Turk website. If it is not
              click the button to copy it to your clipboard and paste it into the Mechanical Turk window to begin the
              process of payment. Your work will be approved within several hours and any performance related bonuses
              will be assigned at that time. We really appreciate your time.
            </p>
          </template>
          <template #left>
            <div class="text-left text-muted-foreground">
              <h3 class="text-lg font-bold mb-2">Completion Code</h3>
              <p class="text-sm text-muted-foreground">
                Verify this code appears in your Mechanical Turk submission form, or copy it manually.
              </p>
            </div>
          </template>
          <template #right>
            <div class="border border-border text-left bg-muted p-6 rounded-lg">
              <h3 class="text-lg font-semibold mb-4 text-foreground">Unique completion code:</h3>
              <div class="flex items-center gap-4 mb-4">
                <Input v-model="completionCode" readonly class="text-2xl completioncode-mturk" />
                <Button variant="default" data-clipboard-target=".completioncode-mturk">
                  Copy Code
                  <i-fa6-solid-clipboard />
                </Button>
              </div>
            </div>
          </template>
        </TitleTwoCol>
      </div>

      <div v-if="api.getRecruitmentService() == 'citizensci'">
        <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
          <template #title>
            <h1 class="text-3xl font-bold mb-4">
              <i-fa6-solid-square-check class="inline mr-2" />&nbsp;Thanks, let's begin the payment process!
            </h1>
            <p class="text-lg mb-8">This still needs to be implemented</p>
          </template>
          <template #left>
            <div class="text-left text-muted-foreground">
              <h3 class="text-lg font-bold mb-2">Submission</h3>
              <p class="text-sm text-muted-foreground">Click the button to complete your submission.</p>
            </div>
          </template>
          <template #right>
            <div class="border border-border text-left bg-muted p-6 rounded-lg">
              <Button
                variant="default"
                as="a"
                :href="!appconfig.anonymousMode ? 'http://gureckislab.org' : 'http://google.com'"
              >
                Submit my work
                <i-fa6-solid-arrow-right />
              </Button>
            </div>
          </template>
        </TitleTwoCol>
      </div>

      <div v-if="api.getRecruitmentService() == 'web'">
        <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
          <template #title>
            <h1 class="text-3xl font-bold mb-4">
              <i-fa6-solid-square-check class="inline mr-2" />&nbsp;Thanks for your contribution to science!
            </h1>
            <p class="text-lg mb-8">
              Your data have been successfully recorded and you can close this window or navigate to another page.
            </p>
          </template>
          <template #left>
            <div class="text-left text-muted-foreground">
              <h3 class="text-lg font-bold mb-2">Study Complete</h3>
              <p class="text-sm text-muted-foreground">
                Thank you for participating in our research study. Your contribution helps advance scientific knowledge.
              </p>
            </div>
          </template>
          <template #right>
            <div class="border border-border text-left bg-muted p-6 rounded-lg">
              <p class="text-foreground">You may now safely close this browser window.</p>
            </div>
          </template>
        </TitleTwoCol>
      </div>
    </div>
  </div>
</template>
