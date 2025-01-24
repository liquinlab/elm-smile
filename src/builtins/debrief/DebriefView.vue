<script setup>
import DebriefText from '@/builtins/debrief/DebriefText.vue' // get access to the global store
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

function finish() {
  // do stuff if you want
  api.stepNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <DebriefText />
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
