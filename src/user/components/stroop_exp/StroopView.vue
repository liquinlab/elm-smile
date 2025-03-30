<script setup>
// A Basic Stroop Experiment

// first import from basic functions from Vue
import { ref, onMounted } from 'vue'

// do you need keyboard or mouse for your experiment?
import { onKeyDown } from '@vueuse/core'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
// now we create the trial stepper which will advance through the trials.
const stepper = api.useStepper()
stepper.clear() // don't remember across reloads

/*
   Next we need to define the trials for the experiment.  Create
   a list composed of objects where each entry in the list is a trial
   and the keys of the object are the variables that define each trial.
   For example here we define a stroop experiment and so we mention
   the word to display, the color of the word, and the condition of the
   trial for later analysis.
*/
// define the trials for the experiment
stepper.t
  .append([
    { path: 'trial_a', word: 'SHIP', color: 'red', condition: 'unrelated' },
    { path: 'trial_b', word: 'MONKEY', color: 'green', condition: 'unrelated' },
    { path: 'trial_c', word: 'ZAMBONI', color: 'blue', condition: 'unrelated' },
    { path: 'trial_d', word: 'RED', color: 'red', condition: 'congruent' },
    { path: 'trial_e', word: 'GREEN', color: 'green', condition: 'congruent' },
    { path: 'trial_f', word: 'BLUE', color: 'blue', condition: 'congruent' },
    { path: 'trial_g', word: 'GREEN', color: 'red', condition: 'incongruent' },
    { path: 'trial_h', word: 'BLUE', color: 'green', condition: 'incongruent' },
    { path: 'trial_i', word: 'RED', color: 'blue', condition: 'incongruent' },
  ])
  .shuffle()
  .append([{ path: 'summary' }])
  .push()

// add the autofill/expected data fields
// state.trials.forEach((trial) => {
//   if (typeof trial.reactionTime !== 'number') {
//     trial.reactionTime = () => api.faker.rnorm(500, 50)
//   }
//   if (typeof trial.accuracy !== 'number') {
//     trial.accuracy = () => api.faker.rbinom(1, 0.8)
//   }
//   if (typeof trial.response !== 'string') {
//     trial.response = () => api.faker.rchoice(['r', 'g', 'b'])
//   }
// })

// 1. what do do when you don't know how many trials there will be
// 2. how do you handle heirarchical steps (like trials with steps in them)

// autofill all the trials
function autofill() {
  api.log.debug('running autofill')
  // while (step.index() < cs.trials.length) {
  //   api.log.debug('auto stepping')

  //   // autofill the trial
  //   // api.faker.render() will autofill the trial with the expected data
  //   // if the trial has already been filled by user it will not be changed
  //   cs.trials[step.index()] = api.faker.render(cs.trials[step.index()])
  //   cs.final_score = 100
  //   api.recordTrialData(cs.trials[step.index()])

  //   step.next()
  // }
  // step to where we want to go
}

//api.setPageAutofill(autofill)

// the timer for recording reaction time
const trialStartTime = ref(0)

onMounted(() => {
  trialStartTime.value = performance.now()
})

// Handle the key presses for the task
// onKeyDown is a composable from the VueUse package
// it takes a list of keys to list for each time a key
// is pressed runs the provided function.
const stop = onKeyDown(
  ['r', 'R', 'g', 'G', 'b', 'B'],
  (e) => {
    if (stepper.index < stepper.length) {
      e.preventDefault()
      api.log.debug('pressed ${e}')
      const reactionTime = performance.now() - trialStartTime.value
      if (['r', 'R'].includes(e.key)) {
        // handle Red
        api.log.debug('red')
      } else if (['g', 'G'].includes(e.key)) {
        // handle Green
        api.log.debug('green')
      } else if (['b', 'B'].includes(e.key)) {
        // handle Blue
        api.log.debug('blue')
      }
      stepper.data.accuracy = stepper.data.color === e.key ? 1 : 0
      stepper.data.response = e.key
      stepper.data.reactionTime = reactionTime
      api.recordTrialData(stepper.data)
      stepper.next()

      // if we are at the end of the trials, compute a final score
      if (stepper.index >= stepper.length) {
        stepper.data.final_score = 100
      }
    }
  },
  { dedupe: true }
)

function finish() {
  stop() // This removes the keydown listener
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <!-- Show this for each trial -->
    <div class="strooptrial" v-if="stepper.index < stepper.length">
      {{ stepper.index }} / {{ stepper.length }}
      <h1 class="title is-1 is-huge" :class="stepper.data.color">{{ stepper.data.word }}</h1>
      <p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>

      <!-- debugging 
      <hr />
      <div v-for="t in cs.trials">
        <span v-for="tr in t">{{ tr }},</span>
      </div>
      end debugging -->
    </div>

    <!-- Show this when you are done with the trials and offer a button
         which will advance to the next route -->
    <div class="endoftask" v-else>
      <p id="prompt">Thanks! You are finished with this task and can move on.</p>
      <!-- display the final score -->
      <p>Your score was {{ stepper.data.final_score }}</p>
      <button class="button is-success" id="finish" @click="finish()">
        Continue &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </button>

      <!-- debugging -->
      {{ stepper.data.final_score }}
      <div v-for="t in stepper.trials">
        <span v-for="tr in t">{{ tr }},</span>
      </div>
      <!-- end debugging -->
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
