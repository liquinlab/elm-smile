<script setup>
import { onMounted } from 'vue'
// import and initalize smile API
import useSmileAPI from '@/core/composables/smileapi'
const api = useSmileAPI()

function finish() {
  // if there's anything else you wanted to do here
  // smilestore.saveData()
  api.stepNextRoute()
}

onMounted(() => {
  api.getBrowserFingerprint()
})
</script>

<template>
  <div class="page prevent-select">
    <br /><br /><br />
    <img src="@/assets/brain.svg" width="220" />
    <h1 class="title is-3">Please help us understand the mind!</h1>
    <p>Take part in a short experiment where you play a game for money.</p>
    <br />
    <button class="button is-warning" id="begintask" @click="finish()">
      I'm ready! &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>

<style scoped></style>
