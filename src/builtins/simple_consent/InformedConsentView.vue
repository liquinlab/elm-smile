<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { animate } from 'motion'
import appconfig from '@/core/config'
import { Button } from '@/uikit/components/ui/button'
import { Card, CardContent } from '@/uikit/components/ui/card'
import { Input } from '@/uikit/components/ui/input'
import { Switch } from '@/uikit/components/ui/switch'
import { Label } from '@/uikit/components/ui/label'

//import InformedConsentText from '@/user/components/InformedConsentText.vue'
const props = defineProps({
  informedConsentText: {
    type: Object,
    required: true,
  },
})
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

function finish() {
  api.goNextView()
}

if (appconfig.anonymousMode) {
  // Skip the consent form if in anonymous mode
  finish()
}

function wiggle() {
  if (api.persist.agree) {
    animate(button.value, { rotate: [0, 5, -5, 5, -5, 0] }, { duration: 1.25 }).finished.then(() => {
      timer = setTimeout(wiggle, 2000) // Reinitialize the timer after animation
    })
  }
}

// if (!api.persist.agree?.value) {
//   api.persist.agree = ref(false)
// }
const name = ref('enter your name')
const button = ref(null)
let timer

if (!('agree' in api.persist)) {
  api.persist.agree = ref(false)
}

if (api.persist.agree) {
  watch(api.persist.agree, (newVal) => {
    if (newVal) {
      console.log('agree changed')
      //button.value.focus()
      timer = setTimeout(wiggle, 3000)
    }
  })
}

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <div class="select-none w-4/5 mx-auto">
    <div class="mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7">
          <div class="pt-5 text-foreground">
            <component :is="informedConsentText" />
          </div>
        </div>
        <div class="lg:col-span-5">
          <Card class="mt-8 bg-muted">
            <CardContent class="bg-muted">
              <p class="text-left font-semibold text-foreground mb-4">
                We first must verify that you are participating willingly and know your rights. Please take the time to
                read the consent form (you can scroll the page).
              </p>
              <div class="border-t border-gray-200 my-4"></div>

              <div class="flex items-center space-x-2 mb-4">
                <Switch v-model="api.persist.agree" id="consent_toggle" name="consent_toggle" size="lg" />
                <Label for="consent_toggle" class="text-left text-sm font-medium">
                  I consent and am over 18 years old.
                </Label>
              </div>

              <div class="hidden">
                <Label for="your_name" class="text-sm font-medium text-gray-700 mb-2 block">
                  Required! Please enter your name:
                </Label>
                <Input id="your_name" name="your_name" v-model="name" placeholder="Enter your name" class="w-full" />
              </div>

              <div class="mt-6">
                <Button
                  ref="button"
                  variant="default"
                  size="lg"
                  class="w-full"
                  v-if="api.persist.agree"
                  @click="finish()"
                >
                  Let's start
                  <svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove all Bulma-specific styles as we're now using Tailwind CSS */
</style>
