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
const smile = api.useStepper()

/*
   Next we need to define the trials for the experiment.  Create
   a list composed of objects where each entry in the list is a trial
   and the keys of the object are the variables that define each trial.
   For example here we define a stroop experiment and so we mention
   the word to display, the color of the word, and the condition of the
   trial for later analysis.
*/
// define the trials for the experiment
const trials = smile
  .table()
  .append({
    path: 'stroop',
    rt: 'fake',
    accuracy: 'fake',
    response: 'fake',
  })
  .forEach((row) => {
    row.append([
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
    //.shuffle()
  })
  .append([{ path: 'summary' }])
smile.push(trials, true)
// path -> label or name

if (!smile.globals.hits) {
  smile.globals.hits = 0
  smile.globals.attempts = 0
}

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

api.setPageAutofill(autofill)

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
    if (smile.index < smile.length) {
      e.preventDefault()
      api.log.debug('pressed ${e}')
      const reactionTime = performance.now() - trialStartTime.value
      // if (['r', 'R'].includes(e.key)) {
      //   // handle Red
      //   api.log.debug('red')
      // } else if (['g', 'G'].includes(e.key)) {
      //   // handle Green
      //   api.log.debug('green')
      // } else if (['b', 'B'].includes(e.key)) {
      //   // handle Blue
      //   api.log.debug('blue')
      // }
      smile.data.hit = 0
      if (smile.data.color[0] === e.key) {
        smile.data.hit = 1
        smile.globals.hits = smile.globals.hits + 1
      }
      smile.globals.attempts = smile.globals.attempts + 1
      //smile.data.addField('response', e.key)
      smile.data.reactionTime = reactionTime
      //console.log('smile.mdata', smile.mdata)
      api.recordTrialData(smile.data)
      smile.next()

      // if we are at the end of the trials, compute a final score
      if (smile.index >= smile.length) {
        smile.globals.final_score = (smile.globals.hits / smile.length) * 100
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
    <div class="strooptrial" v-if="smile.index < smile.length">
      {{ smile.index }} / {{ smile.length }}
      <h1 class="title is-1 is-huge" :class="smile.data.color">{{ smile.data.word }}</h1>
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
      <p>Your score was {{ smile.globals.final_score }}</p>

      <button class="button is-success" id="finish" @click="finish()">
        Continue &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </button>

      <!-- debugging -->
      <br />
      <div v-for="t in smile.trials">
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
