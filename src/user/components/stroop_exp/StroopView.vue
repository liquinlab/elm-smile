<script setup>
// A Basic Stroop Experiment

// first import from basic functions from Vue
import { onMounted } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// define the trials for the experiment as a spec
const trials = api
  .spec()
  .append({
    path: 'stroop',
    rt: () => api.faker.rnorm(500, 50), // add the autofill/expected data fields
    hit: () => api.faker.rbinom(1, 0.8),
    response: () => api.faker.rchoice(['r', 'g', 'b']),
  })
  .forEach((row) => {
    row
      .append([
        { path: 'a', word: 'SHIP', color: 'red', condition: 'unrelated' },
        { path: 'b', word: 'MONKEY', color: 'green', condition: 'unrelated' },
        { path: 'c', word: 'ZAMBONI', color: 'blue', condition: 'unrelated' },
        { path: 'd', word: 'RED', color: 'red', condition: 'congruent' },
        { path: 'e', word: 'GREEN', color: 'green', condition: 'congruent' },
        { path: 'f', word: 'BLUE', color: 'blue', condition: 'congruent' },
        { path: 'g', word: 'GREEN', color: 'red', condition: 'incongruent' },
        { path: 'h', word: 'BLUE', color: 'green', condition: 'incongruent' },
        { path: 'i', word: 'RED', color: 'blue', condition: 'incongruent' },
      ])
      .shuffle()
  })
  .append([{ path: 'summary' }])
api.addSpec(trials, true)

if (!api.globals.hits) {
  api.globals.hits = 0
  api.globals.attempts = 0
}

// autofill all the trials
function autofill() {
  while (api.stepIndex < api.nSteps) {
    // api.faker.render() will autofill the trial with the expected data
    // if the trial has already been filled by user it will not be changed
    api.faker.render(api.stepData)
    api.globals.hits = api.globals.hits + api.stepData.hit.val
    api.globals.attempts = api.globals.attempts + 1
    api.recordStep()
    api.goNextStep()
  }
  updateScore()
}

api.setAutofill(autofill)

function updateScore() {
  api.globals.finalScore = (api.globals.hits / api.globals.attempts) * 100
}

// Handle the key presses for the task
const stop = api.onKeyDown(
  ['r', 'R', 'g', 'G', 'b', 'B'], // list of keys to listen for
  (e) => {
    if (api.stepIndex < api.nSteps) {
      e.preventDefault()
      const reactionTime = api.elapsedTime()
      const hit = api.stepData.color[0] === e.key ? 1 : 0
      api.stepData.hit = hit
      api.globals.hits += hit
      api.globals.attempts = api.globals.attempts + 1
      api.stepData.rt = reactionTime
      api.stepData.response = e.key
      api.recordStep()
      api.goNextStep()

      // if we are at the end of the trials, compute a final score
      if (api.stepIndex >= api.nSteps) {
        updateScore()
      }
    }
  },
  { dedupe: true }
)

function finish() {
  stop() // This removes the keydown listener
  api.goNextView()
}

onMounted(() => {
  api.startTimer()
})
</script>

<template>
  <div class="page prevent-select">
    <!-- Show this for each trial -->
    <div class="strooptrial" v-if="api.path[0] == 'stroop'">
      {{ api.stepIndex }} / {{ api.nSteps }}
      <h1 class="title is-1 is-huge" :class="api.stepData.color">{{ api.stepData.word }}</h1>
      <p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>
    </div>

    <!-- Show this when you are done with the trials and offer a button
         which will advance to the next route -->
    <div class="endoftask" v-else>
      <p id="prompt">Thanks! You are finished with this task and can move on.</p>
      <!-- display the final score -->
      <p>Your score was {{ api.globals.finalScore.toFixed(2) }}%</p>
      <button class="button is-success" id="finish" @click="finish()">
        Continue &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/*  pick your colors for the stroop design here */
.red {
  color: rgb(240, 75, 75);
}

.blue {
  color: rgb(118, 193, 237);
}

.green {
  color: rgb(123, 199, 123);
}
</style>
