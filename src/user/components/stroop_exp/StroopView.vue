<!-- <script>
// eslint-disable-next-line import/prefer-default-export
export function preloadAllImages() {
  setTimeout(() => {
      Object.values(import.meta.glob('@/assets/**/*.{png,jpg,jpeg,svg,SVG,JPG,PNG,JPEG}', { eager: true, query: '?url', import: 'default' })).forEach((url) => {
        const image = new Image();
        image.src = url;
      });
    }, 1);
}
</script> -->

<script setup>
// A Basic Stroop Experiment

// first import from basic functions from Vue
import { ref, computed } from 'vue'

// do you need keyboard or mouse for your experiment?
import { onKeyDown } from '@vueuse/core'
//import { useMouse } from '@vueuse/core'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// this progress bar is not implemented and a little hard so lets pass for now
//if (route.meta.progress) smilestore.global.progress = route.meta.progress

/*
   Next we need to define the trials for the experiment.  Create
   a list composed of objects where each entry in the list is a trial
   and the keys of the object are the variables that define each trial.
   For example here we define a stroop experiment and so we mention
   the word to display, the color of the word, and the condition of the
   trial for later analysis.

*/
const trialTypes = [
  { word: 'SHIP', color: 'red', condition: 'unrelated' },
  { word: 'MONKEY', color: 'green', condition: 'unrelated' },
  { word: 'ZAMBONI', color: 'blue', condition: 'unrelated' },
  { word: 'RED', color: 'red', condition: 'congruent' },
  { word: 'GREEN', color: 'green', condition: 'congruent' },
  { word: 'BLUE', color: 'blue', condition: 'congruent' },
  { word: 'GREEN', color: 'red', condition: 'incongruent' },
  { word: 'BLUE', color: 'green', condition: 'incongruent' },
  { word: 'RED', color: 'blue', condition: 'incongruent' },
]

var trials = []

// add the data fields
for (let trialType of trialTypes) {
  trials.push({
    ...trialType,
    reactionTime: () => api.faker.rnorm(500, 50),
    accuracy: () => api.faker.rbinom(1, 0.8),
    response: () => api.faker.rchoice(['r', 'g', 'b']),
  })
}

api.debug(trials)

// next we shuffle the trials
trials = api.shuffle(trials)

function autofill() {
  api.debug('running autofill')
  while (step.index() < trials.length) {
    api.debug('auto stepping')

    var t = api.faker.render(trials[step.index()])
    api.debug(t)
    api.recordTrialData(t)

    step.next()
  }
  // step to where we want to go
}

api.setPageAutofill(autofill)

//const index = smilestore.getPage[route.name]
// now we create the trial stepper which will advance through the trials.
// this method includes a callback function that is called when the
// last trial is shown.  this might be where you do some additional data saving
// or analysis (e.g., if you are showing the subject performance feedback about
// their performance on the task).  it called the finalize() function which is
// defined below
const step = api.useStepper(trials)
var final_score = ref(0)
// const trial = computed(() => {
//   return trials[api.getCurrentTrial()]
// })

// Handle the key presses for the task
// onKeyDown is a composable from the VueUse package
// it takes a list of keys to list for each time a key
// is pressed runs the provided function.
const stop = onKeyDown(
  ['r', 'R', 'g', 'G', 'b', 'B'],
  (e) => {
    if (step.index() < trials.length) {
      e.preventDefault()
      api.debug('pressed ${e}')
      if (['r', 'R'].includes(e.key)) {
        // handle Red
        api.debug('red')
      } else if (['g', 'G'].includes(e.key)) {
        // handle Green
        api.debug('green')
      } else if (['b', 'B'].includes(e.key)) {
        // handle Blue
        api.debug('blue')
      }
      api.recordTrialData({
        trialnum: step.index(),
        word: step.current().word,
        color: step.current().color,
        condition: step.current().condition,
        response: e.key,
      })
      step.next()

      // if we are at the end of the trials, compute a final score
      if (step.index() >= trials.length) {
        final_score.value = 100
        stop() // This removes the keydown listener
      }
    }
  },
  { dedupe: true }
)

function finish() {
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <!-- Show this for each trial -->
    <div class="strooptrial" v-if="step.index() < trials.length">
      {{ step.index() }} / {{ trials.length }}
      <h1 class="title is-1 is-huge" :class="step.current().color">{{ step.current().word }}</h1>
      <p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>
    </div>

    <!-- Show this when you are done with the trials and offer a button
         which will advance to the next route -->
    <div class="endoftask" v-else>
      <p id="prompt">Thanks! You are finished with this task and can move on.</p>
      <!-- display the final score -->
      <p>Your score was {{ final_score }}</p>
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
