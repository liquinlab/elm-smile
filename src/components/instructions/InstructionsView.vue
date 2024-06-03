<script setup>
import { computed } from 'vue'
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()

// computed property based on condition in data
const instText = computed(() => {
  // how do you know that instructions will exist because it
  // starts off empty?
  if (api.data.conditions.instructions === 'version1') {
    return 'instructions version 1'
  }
  if (api.data.conditions.instructions === 'version2') {
    return 'instructions version 2'
  }
  if (api.data.conditions.instructions === 'version3') {
    return 'instructions version 3'
  }
  return 'no condition set'
})

function finish(goto) {
  api.stepNextRoute()
}
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Instructions</h1>
    <p class="has-text-center is-size-5">{{ instText }}</p>
    <hr />
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
