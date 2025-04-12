<script setup>
import { computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

const cond = api.getConditionByName('instructionsVersion')

// computed property based on condition in data
const instText = computed(() => {
  // how do you know that instructions will exist because it
  // starts off empty?
  if (cond === '1') {
    return 'instructions version 1'
  }
  if (cond === '2') {
    return 'instructions version 2'
  }
  if (cond === '3') {
    return 'instructions version 3'
  }
  return 'no condition set'
})

function finish(goto) {
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Instructions</h1>
    <p class="has-text-center is-size-5">{{ instText }}</p>
    <hr />
    <button class="button is-success" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
