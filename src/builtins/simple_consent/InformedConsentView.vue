<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { animate } from 'motion'
import appconfig from '@/core/config'

import InformedConsentText from '@/user/components/InformedConsentText.vue'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

function finish() {
  api.stepNextView()
}

if (appconfig.anonymousMode) {
  // Skip the consent form if in anonymous mode
  finish()
}

function wiggle() {
  if (agree.value) {
    animate(button.value, { rotate: [0, 5, -5, 5, -5, 0] }, { duration: 1.25 }).finished.then(() => {
      timer = setTimeout(wiggle, 2000) // Reinitialize the timer after animation
    })
  }
}

const agree = ref(false)
const name = ref('enter your name')
const button = ref(null)
let timer

watch(agree, (newVal) => {
  if (newVal) {
    console.log('agree changed')
    //button.value.focus()
    timer = setTimeout(wiggle, 3000)
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <div class="page">
    <div class="pagecontent">
      <div class="has-background-light bumper">
        <div class="columns">
          <div class="column is-7">
            <div class="consenttext">
              <InformedConsentText />
            </div>
          </div>
          <div class="column is-5">
            <div class="box consentbox">
              <p class="has-text-left has-text-weight-semibold">
                We first must verify that you are participating willingly and know your rights. Please take the time to
                read the consent form (you can scroll the page).
              </p>
              <hr />

              <FormKit
                v-model="agree"
                type="checkbox"
                name="consent_toggle"
                label="I consent and am over 18 years old."
                validation="accepted"
                validation-visibility="dirty"
                label-class="has-text-left"
              />
              <div class="hname">
                Required! Please enter your name:
                <input type="text" name="your_name" label="enter your name" v-model="name" />
              </div>

              <br />

              <button ref="button" class="button is-warning is-fullwidth" id="finish" v-if="agree" @click="finish()">
                Let's start &nbsp;
                <FAIcon icon="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bumper {
  border-radius: 2%;
}
.consentbox {
  margin-bottom: 20px;
  margin-top: 30px;
  margin-right: 2vw;
  margin-left: 2vw;
}

.consenttext {
  margin-right: 2vw;
  margin-left: 2vw;
}

.widetoggle {
  --toggle-width: 5.9rem;
}

.hname {
  visibility: hidden;
  display: none;
}
</style>
