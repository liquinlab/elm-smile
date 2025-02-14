<script setup>
import { ref, computed } from 'vue'
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

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

const step = api.useStepper(trials)

// const index = ref(0)
// trials = shuffle(trials) // shuffle is not "in place"

// load up the trials including any randomization based on the random see
// initialize the state of the component
// set up the call backs that take you through the task

function next() {
  if (step.index() < trials.length - 1) {
    step.next()
  } else {
    api.goNextView()
  }
}

function prev() {
  if (step.index() > 0) {
    step.prev()
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
    {{ step.current().sentence }}/{{ step.index() }}<br /><br />
    <button class="button is-success is-light" id="finish" @click="prev()" v-if="step.index() > 0">
      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; prev
    </button>
    &nbsp;&nbsp;&nbsp;
    <button class="button is-success" id="finish" @click="next()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
