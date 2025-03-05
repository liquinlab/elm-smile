# :ladder: Stepping Through Trials
For some conditions in your experiment, you may want to repeat several trials
of the same event. Smile provides a trial stepper for organizing and managing
sequenced events _within_ a View. This way, you can avoid repeating a 
[View](/views) multiple times in your [timeline](/timeline). 

<img src="/images/steps.png" width="600" alt="steps example" style="margin: auto;">

Here, we introduce the concept of a "step" and how to programmatically advance
through a sequence of steps within a particular View. The canonical use is for trials within an experiment, but the same concept applies for any sequential presentation (e.g., a sequence of
instructions, a multi-part form, or an animation).

::: tip Steps are like builds in a Keynote/Powerpoint animation

By way of analogy, think of different [Views](/views) as slides in a
Keynote/Powerpoint presentation while a step is like a build or animation
**within** a slide.

:::

A key feature of stepped Views is that their state persists in the browswer
through the use of local storage. This means that if the subject reloads the page, or
navigates to a different site and then returns, the task will resume from the
same step. This is nice because it helps ensure that subjects are always
completing the set of steps/trials assigned to them and are not able to start
the task over (possibly introducing biased data from practice effects or
exposure to different manipulations). You can learn more about this feature by reading
about how to [persist stepper state](#persisting-stepper-state)

## Create a stepped View

To create a stepped view, you need to import the SmileAPI, define a list of
trials and then use the `useTrialStepper` method to advance through the trials.
Here we walk through the steps.

### Import the SmileAPI

In your `<script setup>` section, import the SmileAPI and initialize it. Next,
construct a trial stepper using the `useTrialStepper` method and save it into
a variable (`step`). This trial stepper will allow you to advance through the
trials. 

```vue
<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const step = api.useTrialStepper()

</script>
```

### Define the trials: simple

Next, still in `<script setup>`, you can define your trials. Each trial 
is an object with keys which define the information displayed for that
trial. Below is a simple example of two trials with the same keys. 

```js
var trials = [
  { shape: ['circle'], color: ['red'] },
  { shape: ['square'], color: ['green'] },
  ... // more trials
]
```
Next, to add your trials to the trial stepper, simply push the list of
trials to `step` as follows:

```js
step.push(trials)
```

### Define the trials: advanced


You can also define your trials by providing all of the different
values for a given key. The trial stepper will then generate the unique trial conditions in a customizable
way. An example is shown below.

```js
var trials = {
  shape: ['circle', 'square', 'triangle'],
  color:['red', 'green', 'blue'],
  }
```

When pushing your trials to the trial stepper, there are a number of
additional fields you can configure to make sure the total structure
of trials is fit to your experiment. 

#### Zip or Outer 

The `method` metafield will determine how the values in each list of
keys will be combined. in the `zip` option, the values will be paired
based on their list positions. If `zip` is chosen, the lists of keys
being zipped must be the same length. 
```js
const step = api.useTrialStepper()

var trials = {
  shape: ['circle', 'square', 'triangle'],
  color:['red', 'green', 'blue']
  }

step.push(trials, {method: 'zip'})

// trials = [{shape: 'circle', color: 'red'},
//           {shape: 'square', color: 'green'},
//           {shape: 'triangle', color: 'blue'}]
```

The `outer` option is best for defining nested trials, or where all combinations of trial parameters should be shown. With this option, the 
trials will include the outer product of the key values. The first key can be thought of as the top level condition, and each 
subsequent key is a subcondition of it. Using the same trials variable,
`outer` will result in the following trials. 

```js
const step = api.useTrialStepper()

var trials = {
  shape: ['circle', 'square', 'triangle'],
  color:['red', 'green', 'blue']
  }

step.push(trials, {method: 'outer'})

// trials = [{shape: 'circle', color: 'red'},
//           {shape: 'circle', color: 'green'},
//           {shape: 'circle', color: 'blue'},

//           {shape: 'square', color: 'red'},
//           {shape: 'square', color: 'green'},
//           {shape: 'square', color: 'blue'},

//           {shape: 'triangle', color: 'red'},
//           {shape: 'triangle', color: 'green'},
//           {shape: 'triangle', color: 'blue'}]
```
#### Defining data columns
You can indicate any expected data fields associated with 
each of the trials and specify if you want to autofill them with mock
data from a certain distribution. When pushing your data to the 
trial stepper, `autofill` will be true by 
default if you specify the data distributions, but can be set to 
false if you would like to populate all datacolumns with null values. 
For both the `zip` and `outer` methods, the data columns will be
appended to every unique trial. 

```js
const step = api.useTrialStepper()

var trials = {
  shape: ['circle', 'square', 'triangle'],
  color:['red', 'green', 'blue'],
  reactionTime: api.faker.rnorm(3, 5), 
  accuracy: null,
  }

step.push(trials, {method: 'zip', autofill: true})

// trials = [{shape: 'circle', color: 'red', reactionTime: [5.12, 4.87, 5.66], accuracy: null},
//           {shape: 'square', color: 'green', reactionTime: [4.77, 4.56, 5.71], accuracy: null},
//           {shape: 'triangle', color: 'blue', reactionTime: [5.09, 4.50, 5.02], accuracy: null}]
```

#### Shuffle

The `shuffle` metafield will determine whether the trials are added to the 
stepper in their default order or in a randomized order. By default, `shuffle`
will be set to false, which means the trials will keep their defined order. 
If `shuffle` is set to true, the trials will be loaded in a random order. 

```js
const step = api.useTrialStepper()

var trials = {
  shape: ['circle', 'square', 'triangle'],
  color:['red', 'green', 'blue']
  }

step.push(trials, {method: 'zip', shuffle: true})

// trials = [{shape: 'square', color: 'green'},
//           {shape: 'circle', color: 'red'},
//           {shape: 'triangle', color: 'blue'}]
```

#### Repeat

Finally, the `repeat` metafield allows you to repeat the same trial multiple
times without changing any of the key values. `repeat` takes on integer values, 
and will result in the following trials. An `index` field will be automatically
generated. 

```js
const step = api.useTrialStepper()

var trials = {
  shape: ['circle', 'square', 'triangle'],
  color:['red', 'green', 'blue']
  }

step.push(trials, {method: 'zip', shuffle: true, repeat: 5})

// trials = [{shape: 'square', color: 'green', index: 0},
//           {shape: 'square', color: 'green', index: 1},
//           {shape: 'square', color: 'green', index: 2},
//           {shape: 'square', color: 'green', index: 3},
//           {shape: 'square', color: 'green', index: 4},
//           {shape: 'circle', color: 'red', index: 0},
//           {shape: 'circle', color: 'red', index: 1},
//           {shape: 'circle', color: 'red', index: 2},
//           {shape: 'circle', color: 'red', index: 3},
//           {shape: 'circle', color: 'red', index: 4},
//           {shape: 'triangle', color: 'blue', index: 0},
//           {shape: 'triangle', color: 'blue', index: 1},
//           {shape: 'triangle', color: 'blue', index: 2},
//           {shape: 'triangle', color: 'blue', index: 3},
//           {shape: 'triangle', color: 'blue', index: 4}]
```

### Stepping through the trials
The trial stepper will allow you to iterate over the trials and populate
your View with the unique values given in each trial. The structure of the 
trial stepper should make it easy and flexible for you to set up multiple
nested conditions with different degrees of randomization and reptition for 
each experiment page!

The methods for each stepper object include: 

- `step.next()`: Advance to the next trial
- `step.prev()`: Go back to the previous trial
- `step.index()`: Get the global index of the current trial
- `step.reset()`: Reset stepper back to the first trial

When the last step is reached, `step.next()` will call the callback function 
passed to `api.useStepper()`. 

::: warning You are responsible detecting when the last step is reached!

You are responsible for detecting when the last step is reached and taking
appropriate action (e.g., saving data, computing a score, etc.). This condition
is met usually when `step.index()` is equal to the number of trials.

:::

Here is a approximate example of the key features for a simple multi-armed bandit 
task. In this case, we use the trials to determine the unique arm values in each
game and the repetitions to give the partipant multiple samples 

```vue
<script setup>
import { ref } from 'vue'
import useAPI from '@/core/composables/useAPI'
import { onKeyDown } from '@vueuse/core'

// Instantiate your trialStepper 
const api = useAPI()
const step = api.useTrialStepper()

// Either import or manually define the trial data
var armValues = [[10, 24, 8, 11, 9], [44, 19, 6, 13, 12], [30, 21, 7, 2, 14]]


// Convert the dataset into an array of trial objects
const trials = armValues.map(values => ({ arms: values }))

// Push the trials to the stepper with shuffling
// Repeate every trial condition for 20 iterations
const num_iters = 20
step.push(trials, { shuffle: true, repeat: num_iters })

// A reactive value to display the reward
const reward = ref(null)

// Define key mapping for bandit arm indices to keys
// (0: A, 1: S, 2: D, 3: F, 4: G)
const keys = ['a', 's', 'd', 'f', 'g']

function chooseBandit(idx) {
  // Use the current trial's arms array and select the value based on the index
  reward.value = step.value.arms[idx]
}

// Listen for key presses corresponding to the bandits
const stop = onKeyDown(keys, (e) => {
    const key = e.key.toLowerCase()
    const idx = keys.indexOf(key)

    if (idx !== -1) chooseBandit(idx)

    // Record data after every 20 iterations
    if (step.value.index == num_iters - 1) {
      api.recordTrialData({
        trialnum: step.index(),
        arms: step.value.arms,
        choicenum: step.value.index,
    })
    }
    // Advance to the next trial
    step.next()
    
  },
  { dedupe: true }
)
</script>

```

This is the template code for the view. The `step.index()` method is
used to get the current step number, and `step.value` is used to access
the current trial data (e.g. `step.value.arms`).

```vue
<template>
  <div class="experiment">
    <!-- If there's an active trial, display its arms and instructions -->
    <div v-if="step.value">
      <h2>Trial {{ step.index() + 1 }} / {{ step.trials.length }}</h2>
      <p><strong>Arms:</strong> {{ step.value.arms.join(', ') }}</p>
      <p>Press A, S, D, F, or G to choose a bandit.</p>
      <p v-if="reward !== null"><strong>Reward:</strong> {{ reward }}</p>
    </div>
    <!-- When all trials are done, display a completion message -->
    <div v-else>
      <h2>Experiment Completed!</h2>
      <p>Thank you for participating.</p>
    </div>
  </div>
</template>

<style scoped>
.experiment {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
  font-family: sans-serif;
}
</style>
```
