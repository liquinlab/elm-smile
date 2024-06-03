<script setup>
import DebriefText from '@/builtins/debrief/DebriefText.vue' // get access to the global store
// import and initalize smile API
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()

api.setDone()

function finish() {
  // do stuff if you want
  api.stepNextRoute()
}
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">What was that about?</h1>
    <DebriefText />
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
