# :ladder: Stepping Through Trials

For some conditions in your experiment, you may want to repeat several trials of
the same event. Smile provides a trial stepper for organizing and managing
sequenced events _within_ a View. This way, you can avoid repeating a
[View](/views) multiple times in your [timeline](/timeline).

<img src="/images/steps.png" width="600" alt="steps example" style="margin: auto;">

Here, we introduce the concept of a "step" and how to programmatically advance
through a sequence of steps within a particular View. The canonical use is for
trials within an experiment, but the same concept applies for any sequential
presentation (e.g., a sequence of instructions, a multi-part form, or an
animation).

::: tip Steps are like builds in a Keynote/Powerpoint animation

By way of analogy, think of different [Views](/views) as slides in a
Keynote/Powerpoint presentation while a step is like a build or animation
**within** a slide.

:::

A key feature of stepped Views is that their state persists in the browser
through the use of local storage. This means that if the subject reloads the
page, or navigates to a different site and then returns, the task will resume
from the same step. This is nice because it helps ensure that subjects are
always completing the set of steps/trials assigned to them and are not able to
start the task over (possibly introducing biased data from practice effects or
exposure to different manipulations). You can learn more about this feature by
reading about how to [persist stepper state](#persisting-stepper-state)

## Create a stepped View

To create a stepped view, you need to import the SmileAPI, create a trial table,
and then use the `useHStepper` method to advance through the trials. Here we
walk through the steps.

### Import the SmileAPI

In your `<script setup>` section, import the SmileAPI and initialize it. Next,
construct a trial stepper using the `useHStepper` method and save it into a
variable (`stepper`). This trial stepper will allow you to advance through the
trials.

```vue
<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const stepper = api.useHStepper()
</script>
```

### Building Trial Tables

The `useHStepper` provides a powerful API for building and manipulating trial
tables. The main method for creating a new table is `new()`, which returns a
table object with various chainable methods for building your trials.

#### Basic Table Creation and Appending

```js
const stepper = api.useHStepper()

// Create a new table and append some trials
const table = stepper.new().append([
  { shape: 'circle', color: 'red' },
  { shape: 'square', color: 'green' },
])
```

#### Array-like Access

Tables provide array-like access to their rows:

```js
const table = stepper.new().append([
  { shape: 'circle', color: 'red' },
  { shape: 'square', color: 'green' },
])

// Access rows by index
console.log(table[0]) // { shape: 'circle', color: 'red' }

// Get length
console.log(table.length) // 2

// Iterate over rows
for (const row of table) {
  console.log(row)
}

// Use array methods
console.log(table.indexOf({ shape: 'circle', color: 'red' })) // 0
console.log(table.slice(0, 1)) // [{ shape: 'circle', color: 'red' }]
```

#### Combining Trials with zip()

The `zip()` method combines multiple arrays of values into trial objects,
pairing values by their position:

```js
const table = stepper.new().zip({
  shape: ['circle', 'square', 'triangle'],
  color: ['red', 'green', 'blue'],
})

// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'square', color: 'green' },
//   { shape: 'triangle', color: 'blue' }
// ]
```

You can also specify how to handle arrays of different lengths:

```js
// Pad with last value (default)
const table1 = stepper.new().zip({
  shape: ['circle', 'square'],
  color: ['red', 'green', 'blue'],
})
// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'square', color: 'green' },
//   { shape: 'square', color: 'blue' }
// ]

// Loop shorter arrays
const table2 = stepper.new().zip(
  {
    shape: ['circle', 'square'],
    color: ['red', 'green', 'blue'],
  },
  { method: 'loop' }
)
// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'square', color: 'green' },
//   { shape: 'circle', color: 'blue' }
// ]

// Throw error for different lengths
const table3 = stepper.new().zip(
  {
    shape: ['circle', 'square'],
    color: ['red', 'green', 'blue'],
  },
  { method: 'error' }
)
// Throws: "All columns must have the same length when using zip()"
```

#### Creating All Combinations with outer()

The `outer()` method creates all possible combinations of values:

```js
const table = stepper.new().outer({
  shape: ['circle', 'square'],
  color: ['red', 'green'],
})

// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'circle', color: 'green' },
//   { shape: 'square', color: 'red' },
//   { shape: 'square', color: 'green' }
// ]
```

::: warning Safety Limit

The `outer()` method has a safety limit of 5000 combinations to prevent
accidentally creating too many trials. If you exceed this limit, it will throw
an error.

:::

#### Repeating Trials

The `repeat()` method allows you to repeat all trials a specified number of
times:

```js
const table = stepper
  .new()
  .append([
    { shape: 'circle', color: 'red' },
    { shape: 'square', color: 'green' },
  ])
  .repeat(2)

// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'square', color: 'green' },
//   { shape: 'circle', color: 'red' },
//   { shape: 'square', color: 'green' }
// ]
```

#### Modifying Trials with forEach()

The `forEach()` method allows you to modify each trial:

```js
const table = stepper
  .new()
  .append([
    { shape: 'circle', color: 'red' },
    { shape: 'square', color: 'green' },
  ])
  .forEach((row, index) => {
    if (index === 0) {
      return { ...row, color: 'blue' }
    }
    return row
  })

// Results in:
// [
//   { shape: 'circle', color: 'blue' },
//   { shape: 'square', color: 'green' }
// ]
```

### Stepping through the trials

The trial stepper provides methods to navigate through your trials:

- `stepper.next()`: Advance to the next trial
- `stepper.prev()`: Go back to the previous trial
- `stepper.index()`: Get the current trial index
- `stepper.current()`: Get the current trial data
- `stepper.reset()`: Reset back to the first trial

Here's a complete example showing how to use the stepper in a Vue component:

```vue
<script setup>
import { ref } from 'vue'
import useAPI from '@/core/composables/useAPI'

const api = useAPI()
const stepper = api.useHStepper()

// Create a table with multiple conditions
const table = stepper
  .new()
  .outer({
    shape: ['circle', 'square'],
    color: ['red', 'green'],
  })
  .repeat(2)
  .forEach((row) => ({ ...row, size: 'medium' }))

// Reactive state for the current trial
const currentTrial = ref(null)

// Function to advance to next trial
function nextTrial() {
  currentTrial.value = stepper.current()
  stepper.next()
}

// Initialize with first trial
nextTrial()
</script>

<template>
  <div class="experiment">
    <div v-if="currentTrial">
      <h2>Trial {{ stepper.index() + 1 }}</h2>
      <div class="stimulus">
        <div :class="currentTrial.shape" :style="{ color: currentTrial.color }">
          {{ currentTrial.shape }}
        </div>
      </div>
      <button @click="nextTrial">Next Trial</button>
    </div>
    <div v-else>
      <h2>Experiment Complete!</h2>
    </div>
  </div>
</template>

<style scoped>
.experiment {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
}

.stimulus {
  margin: 2rem 0;
  font-size: 2rem;
}
</style>
```

## Data Serialization Limitations

When using the trial stepper, it's important to understand the limitations of
data serialization. The stepper uses JSON serialization to persist trial data,
which means certain JavaScript types cannot be properly stored and retrieved.

### Non-serializable Types

The following types of data will not serialize correctly:

- Functions and methods
- Vue components or other framework components
- DOM elements
- `undefined` values
- Symbols
- BigInt values
- Regular expressions
- Class instances (they lose their methods)
- Circular references

### Best Practices

When storing data in your trials, follow these guidelines:

1. Only store serializable data types:

   - Plain objects
   - Arrays
   - Strings
   - Numbers
   - Booleans
   - null

2. For Vue components, store component information rather than the component
   itself:

```js
// Instead of:
stepper.new().append({ component: MyVueComponent })

// Do:
stepper.new().append({
  componentName: 'MyComponent',
  componentProps: {
    /* serializable props */
  },
})
```

3. For function references, store the necessary data to recreate the behavior:

```js
// Instead of:
stepper.new().append({ handler: () => console.log('hello') })

// Do:
stepper.new().append({
  handlerType: 'log',
  handlerMessage: 'hello',
})
```

4. For complex objects, store only the essential serializable data:

```js
// Instead of:
stepper.new().append({
  complexObject: new ComplexClass(),
})

// Do:
stepper.new().append({
  objectType: 'ComplexClass',
  objectData: {
    /* serializable data */
  },
})
```

Remember that any time you reload the page or navigate away and return, the
trial data will need to be deserialized. Plan your data structure accordingly to
ensure all necessary information can be properly restored.
