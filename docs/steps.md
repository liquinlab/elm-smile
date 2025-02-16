# :ladder: Stepping Views

Many experiments are organized into a series of repeated events called "trials".
Trials are different than [Views](/views) because they often repeat the same
basic structure many times. Smile provides several features for organizing and
managing trials or other sequenced elements _within_ a View (the
[Timeline](/timeline) is used to sequence across Views).

<img src="/images/steps.png" width="600" alt="steps example" style="margin: auto;">

Here, we introduce the concept of a "step" and how to programmatically advance
through a sequence of steps within a particular View. The same concept is also
used to add sequential build to any type of view (e.g., a sequence of
instructions, a multi-part form, or an animation).

::: tip Steps are like builds in a Keynote/Powerpoint animation

By way of analogy, thing of different [Views](/views) as slides in a
Keynote/Powerpoint presentation while a step is like a build or animation
**within** a slide.

:::

A key feature of stepped Views is that they persist their state in the browswer
using local storage. This means that if the subject reloads the pages, or
navigates to a different site and then returns, the task will resume from the
same step. This is nice because it helps ensure that subjects are always
completing the set of steps/trials assigned to them and are not able to start
the task over (possibly introducing biased data from practice effects or
exposure to manipulations). You can learn more about this feature by reading
about how to [persist stepper state](#persisting-stepper-state)

## Create a stepped View

To create a stepped view, you need to import the SmileAPI, define a list of
trials and then use the `useTrialStepper` method to advance through the trials.
Here we walk through the steps.

### Import the SmileAPI

In your `<script setup>` section, import the SmileAPI and initialize it. This
will give you access to the `useTrialStepper` method which will allow you to
advance through the trials.

```vue
<script setup>
import useAPI from '@/core/composables/useAPI' // [!code highlight]
const api = useAPI() // [!code highlight]
</script>
```

### Define the trials

Next, still in `<script setup>`, define a list of trials. Each trial is an
object with keys that define aspects of what you wish to display on a given
trial.

```js
var trials = [
  { word: 'SHIP', color: 'red', condition: 'unrelated' },
  ... // more trials
]
```

### Randomize the trials

You can then shuffle the trials randomly using

```js
trials = api.shuffle(trials)
```

### Use the `useStepper` method

Next, use the `useStepper` method to advance through the trials. This method
uses a Vue composable to provide methods to advance and go back through the
trials.

```js
const step = api.useStepper(trials)
```

The returned object provides:

- `step.next()`: Advance to the next step
- `step.prev()`: Go back to the previous step
- `step.index()`: Get the current trial index
- `step.current()`: Get the current trial data
- `step.reset()`: Reset back to the first step

Each time you want to advance to the next step, you need to call `step.next()`.
You can also step back through the steps by calling `step.prev()`. If
`step.next()` is called when the last step is reached, the callback function
passed to `api.useStepper()` is called.

While you are on a given step you can access the current step number using
`step.index()` (indexed starting at 0). You can also get the current meta-data
of the trials passed as input to `api.useStepper()` by calling `step.current()`.

Call `step.reset()` to reset back to the first step.

::: warning You are responsible detecting when the last step is reached!

You are responsible for detecting when the last step is reached and taking
appropriate action (e.g., saving data, computing a score, etc.). This condition
is met usually when `step.index()` is equal to the number of trials.

:::

Here is a approximate example of the key features for a simple Stroop task.

```vue
<script setup>
// A Basic Stroop Experiment

...

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

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
  ... // more trials
]

// next we shuffle the trials
trials = api.shuffle(trials)

// now we create the trial stepper which will advance through the trials.
// this method includes a callback function that is called when the
// last trial is shown.
const step = api.useStepper(trials)

var final_score = ref(0)


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
        // handle red
      } else if (['g', 'G'].includes(e.key)) {
        // handle green
      } else if (['b', 'B'].includes(e.key)) {
        // handle blue
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
```

This is the template code for the view. Notice that the `step.index()` method is
used to get the current step number and the `step.current()` method is used to
get the current trial data (e.g., `step.current().word`).

```vue
<template>
  <div class="page prevent-select">
    <!-- Show this for each trial -->
    <div class="strooptrial" v-if="step.index() < trials.length">
      {{ step.index() + 1 }} / {{ trials.length }}
      <h1 class="title is-1 is-huge" :class="step.current().color">
        {{ step.current().word }}
      </h1>
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
```

## Persisting stepper state

The stepper state is stored in the application state. This means that if the
subject reloads the pages, or navigates to a different site and then returns,
the task will resume from the same step. This is nice because it helps ensure
that subjects are always completing the set of steps/trials assigned to them and
are not able to start the task over (possibly introducing biased data from
practice effects or exposure to manipulations).
