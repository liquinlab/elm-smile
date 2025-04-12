<script setup>
import { ref, computed } from 'vue'
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

const trials = api
  .spec()
  .append([
    {
      path: 'task2_trial_a',
      task: 'unusual',
      sentence: 'The dog ate the _____.',
      options: ['Meal', 'Bone', 'Food', 'Sun'],
    },
    {
      path: 'task2_trial_b',
      task: 'unusual',
      sentence: 'The cat ate the _____.',
      options: ['Fish', 'Words', 'Food', 'Mouse'],
    },
    {
      path: 'task2_trial_c',
      task: 'unusual',
      sentence: 'The fish ate the _____.',
      options: ['Water', 'Food', 'Car', 'Moon'],
    },
  ])
  .shuffle()
api.addSpec(trials)
// const index = ref(0)
// trials = shuffle(trials) // shuffle is not "in place"

// load up the trials including any randomization based on the random see
// initialize the state of the component
// set up the call backs that take you through the task

function next() {
  if (api.index < trials.length) {
    api.goNextStep()
  } else {
    api.goNextView()
  }
}

function prev() {
  if (api.index > 0) {
    api.goPrevStep()
  }
}
// custom advance to next route when we finish showing all the trials
// function advance() {
//   if (index.value >= trials.length - 1) {
//     goNextView(finalize())
//   } else {
//     index.value += 1
//   }
// }
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Task 2</h1>
    {{ api.stepData.sentence }}/{{ api.index }}<br /><br />
    <button class="button is-success is-light" id="finish" @click="prev()" v-if="api.index > 1">
      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; prev
    </button>
    &nbsp;&nbsp;&nbsp;
    <button class="button is-success" id="finish" @click="next()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
