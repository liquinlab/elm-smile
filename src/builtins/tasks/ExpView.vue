<script setup>
import { onMounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

function finish() {
  // smilestore.saveData()
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Experiment</h1>
    <hr />
    <button class="button is-success" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
