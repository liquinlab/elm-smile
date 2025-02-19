<script setup>
import { ref, reactive, shallowRef, onMounted } from 'vue'
const emit = defineEmits(['nextPageCaptcha'])

import useAPI from '@/core/composables/useAPI'
const api = useAPI()

let MAX_TIME = 5000
let start_time
let timeout = ref(0)

const trials = [
  {
    task: 'unusual',
    sentence: 'The dog ate the _____.',
    options: ['Meal', 'Bone', 'Food', 'Sun'],
  },
  {
    task: 'unusual',
    sentence: 'The cat ate the _____.',
    options: ['Fish', 'Words', 'Food', 'Mouse'],
  },
]

onMounted(() => {
  start_time = Date.now()
  timeout.value = ((MAX_TIME - (Date.now(0) - start_time)) / MAX_TIME) * 100
  //api.debug(timeout)
  var myInterval = setInterval(() => {
    timeout.value = ((MAX_TIME - (Date.now(0) - start_time)) / MAX_TIME) * 100
    if (timeout.value <= 0) {
      clearInterval(myInterval)
      emit('nextPageCaptcha')
    }
  }, 2)
})
</script>

<template>
  <div class="instructions">
    <h1 class="title">Choose the <span class="underline">unusual</span> answer.</h1>
    <div class="box">
      <p class="is-size-3 has-text-left">The dog ate the _____.</p>
      <button class="button is-white mr-4" id="finish" @click="$emit('nextPageCaptcha')">Meal</button>
      <button class="button is-white mr-4" id="finish" @click="$emit('nextPageCaptcha')">Bone</button>
      <button class="button is-white mr-4" id="finish" @click="$emit('nextPageCaptcha')">Food</button>
      <button class="button is-white mr-4" id="finish" @click="$emit('nextPageCaptcha')">Sun</button>
    </div>
    <br />
    <br />
    <br />
    Respond quickly: <progress class="progress is-large" :value="timeout" max="100"></progress>
  </div>
</template>

<style scoped>
.instructions {
  width: 60%;
  margin: auto;
}

.underline {
  text-decoration: underline;
}

.instructions p {
  padding-bottom: 20px;
}

.boxlabel {
  position: absolute;
  left: 1.7em;
  top: 1.2em;
  text-transform: uppercase;
  color: rgb(12, 12, 12);
  font-weight: 600;
  font-size: 0.8em;
}

.box {
  background-color: #41e8b9;
  position: relative;
  padding-top: 2.5em;
}
</style>
