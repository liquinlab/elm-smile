<script setup>
import { ref, computed } from 'vue'
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useViewAPI()

const trials = api.steps.append([
  {
    id: 'task2_trial_a',
    task: 'unusual',
    sentence: 'The dog ate the _____.',
    options: ['Meal', 'Bone', 'Food', 'Sun'],
  },
  {
    id: 'task2_trial_b',
    task: 'unusual',
    sentence: 'The cat ate the _____.',
    options: ['Fish', 'Words', 'Food', 'Mouse'],
  },
  {
    id: 'task2_trial_c',
    task: 'unusual',
    sentence: 'The fish ate the _____.',
    options: ['Water', 'Food', 'Car', 'Moon'],
  },
])
//.shuffle()

// const index = ref(0)
// trials = shuffle(trials) // shuffle is not "in place"

// load up the trials including any randomization based on the random see
// initialize the state of the component
// set up the call backs that take you through the task

function next() {
  if (!api.isLastStep()) {
    api.goNextStep()
  } else {
    api.goNextView()
  }
}

function prev() {
  if (api.stepIndex > 0) {
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
  <div class="page select-none flex flex-col items-center">
    <h1 class="text-2xl font-bold mb-4">Task 2</h1>
    <div class="mb-4">{{ api.stepData.sentence }}/{{ api.stepIndex }}</div>
    <div class="flex gap-4">
      <Button variant="outline" @click="prev()" v-if="api.stepIndex > 0">
        <FAIcon icon="fa-solid fa-arrow-left" />
        prev
      </Button>
      <Button variant="default" @click="next()">
        next
        <FAIcon icon="fa-solid fa-arrow-right" />
      </Button>
    </div>
  </div>
</template>
