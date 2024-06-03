<script setup>
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()

function finish() {
  // smilestore.saveData()
  api.stepNextRoute()
}
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Experiment</h1>
    <hr />
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
