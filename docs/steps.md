# :ladder: Stepping Views

Many experiments are organized into a series of repeated events called "trials".
Trials are different than [Views](/views) because they often repeat the same
basic structure many times. Smile provides several features for organizing and
managing trials or other sequenced elements _within_ a View (the
[Timeline](/timeline) is used to sequence across Views).

Here, we introduce the concept of a "step" and how to programmatically advance
through a sequence of steps within a particular View. The same concept is also
used to add sequential build to any type of view (e.g., a sequence of
instructions, a multi-part form, or an animation).

## Create a trial-based View

To create a trial-based view, you need to import the SmileAPI, define a list of
trials and then use the `useTrialStepper` method to advance through the trials.
Here we walk through the steps.

### Import the SmileAPI

In your `<script setup>` section, import the SmileAPI and initialize it. This
will give you access to the `useTrialStepper` method which will allow you to
advance through the trials.

```vue
<script setup>
...
import useAPI from '@/core/composables/useAPI' // [!code highlight]
const api = useAPI() // [!code highlight]
...
</script>
```

### Define the trials

Next, still in `<script setup>`, define a list of trials. Each trial is an
object with keys that define aspects of what you wish to display on a given
trial.

```js
var trials = [
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
```

### Randomize the trials

You can then shuffle the trials randomly using

```vue
trials = api.shuffle(trials)
```

### Use the `useStepper` method

Next, use the `useStepper` method to advance through the trials. This method
uses a Vue composable to provide the `nextStep` and `prevStep` methods to
advance and go back through the trials. It also provides a callback function
that is called when the last trial is shown. This is where you might do some
additional data saving or analysis.

```js
const { nextStep, prevStep, step, step_index } = api.useStepper(trials, () => {
  finalize()
})
```

```vue
<script setup>
// A Basic Stroop Experiment

// first import from basic functions from Vue
import { ref, computed } from 'vue'

// do you need keyboard or mouse for your experiment?
import { onKeyDown } from '@vueuse/core'
import { useMouse } from '@vueuse/core'

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
var trials = [
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

// next we shuffle the trials
trials = api.shuffle(trials)

//const index = smilestore.getPage[route.name]
// now we create the trial stepper which will advance through the trials.
// this method includes a callback function that is called when the
// last trial is shown.  this might be where you do some additional data saving
// or analysis (e.g., if you are showing the subject performance feedback about
// their performance on the task).  it called the finalize() function which is
// defined below
const { nextStep, prevStep, step, step_index } = api.useStepper(trials, () => {
  finalize()
})

// const trial = computed(() => {
//   return trials[api.getCurrentTrial()]
// })

// Handle the key presses for the task
// onKeyDown is a composable from the VueUse package
// it takes a list of keys to list for each time a key
// is pressed runs the provided function.
onKeyDown(
  ['r', 'R', 'g', 'G', 'b', 'B'],
  (e) => {
    if (step_index < trials.length) {
      e.preventDefault()
      api.debug('pressed ${e}')
      if (['r', 'R'].includes(e.key)) {
        api.debug('red')
      } else if (['g', 'G'].includes(e.key)) {
        api.debug('green')
      } else if (['b', 'B'].includes(e.key)) {
        api.debug('blue')
      }
      api.debug(`${step.value}`)
      api.recordTrialData({
        trialnum: api.getCurrentTrial(),
        word: step.value.word,
        color: step.value.color,
        condition: step.value.condition,
        response: e.key,
      })
      nextTrial()
    }
  },
  { dedupe: true }
)

// load up the trials including any randomization based on the random see
// initialize the state of the component
// set up the call backs that take you through the task
var final_score = ref(0)
function finalize() {
  // sort out what data you are putting in the smile store here?
  api.debug('finished, so will save data and stuff')
  final_score.value = 100 // compute a final score here
}

function finish() {
  // do stuff if you want
  api.stepNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <!-- Show this for each trial -->
    <div class="strooptrial" v-if="step_index < trials.length">
      {{ step_index + 1 }} / {{ trials.length }}
      <h1 class="title is-1 is-huge" :class="step.color">{{ step.word }}</h1>
      <p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>
    </div>

    <!-- Show this when you are done with the trials and offer a button
         which will advance to the next route -->
    <div class="endoftask" v-else>
      <p id="prompt">
        Thanks! You are finished with this task and can move on.
      </p>
      <!-- display the final score -->
      <p>Your score was {{ final_score }}</p>
      <button class="button is-success is-light" id="finish" @click="finish()">
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
```
