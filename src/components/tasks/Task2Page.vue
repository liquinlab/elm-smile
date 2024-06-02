<script setup>
import { ref, computed } from 'vue'
// import and initalize smile API
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()

var trials = [
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
  {
    task: 'unusual',
    sentence: 'The fish ate the _____.',
    options: ['Water', 'Food', 'Car', 'Moon'],
  },
]

// next we shuffle the trials
trials = api.shuffle(trials)

const { nextStep, prevStep, step, step_index } = api.useStepper(trials, api.currentRouteName(), () => {
  finalize()
})

// const index = ref(0)
// trials = shuffle(trials) // shuffle is not "in place"

// load up the trials including any randomization based on the random see
// initialize the state of the component
// set up the call backs that take you through the task

function finalize() {
  // sort out what data you are putting in the smile store here?
  api.debug('finished ')
  finish()
}

function finish() {
  // do stuff if you want
  api.stepNextRoute()
}

function next() {
  if (step_index < trials.length - 1) {
    nextStep()
  } else {
    api.stepNextRoute()
  }
}

function prev() {
  if (step_index > 0) {
    prevStep()
  }
}
// custom advance to next route when we finish showing all the trials
// function advance() {
//   if (index.value >= trials.length - 1) {
//     stepNextRoute(finalize())
//   } else {
//     index.value += 1
//   }
// }
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Task 2</h1>
    {{ step.sentence }}/{{ step_index }}<br /><br />
    <button class="button is-success is-light" id="finish" @click="prev()" v-if="step_index > 0">
      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; prev
    </button>
    &nbsp;&nbsp;&nbsp;
    <button class="button is-success is-light" id="finish" @click="next()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
