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
tables, inspired by jsPsych's timeline system. The main method for creating a
new table is `new()`, which returns a table object with various chainable
methods for building your trials.

#### Basic Table Creation and Appending

```js
const stepper = api.useHStepper()

// Create a new table and append some trials
const table = stepper.new().append([
  { shape: 'circle', color: 'red' },
  { shape: 'square', color: 'green' },
])
```

#### Nested Tables

You can create nested tables within individual rows. This is useful when you
want to create hierarchical trial structures or when each trial needs its own
sequence of sub-trials:

```js
const stepper = api.useHStepper()

// Create a parent table with 3 trials
const trials = stepper.new().range(3)

// Create nested tables for specific trials
trials[0].new().range(3) // First trial gets 3 sub-trials
trials[1].new().range(5) // Second trial gets 5 sub-trials
trials[1].new().append({ color: 'red', shape: 'triangle' }) // Add another sub-trial

// You can chain operations on nested tables
const nestedTable = trials[0]
  .new()
  .range(3)
  .forEach((row) => ({ ...row, type: 'test' }))
  .append([{ index: 3, type: 'extra' }])
```

Each row in a table can have its own nested table, and you can perform all the
same operations on nested tables that you can on parent tables (append, range,
forEach, etc.).

::: tip Multiple Nested Tables

You can create multiple nested tables for the same row. Only the most recently
created table will be stored in the row:

```js
// Create two nested tables for the first trial
const nestedTable1 = trials[0].new().range(2)
const nestedTable2 = trials[0].new().range(3)

// trials[0] will now reference nestedTable2
```

:::

::: warning Data Serialization

Nested tables follow the same serialization rules as regular tables. When
storing nested tables, make sure all data is serializable according to the
guidelines in the
[Data Serialization Limitations](#data-serialization-limitations) section.

:::

::: warning Dimensionality Changes

Once you create nested tables within a parent table, you cannot modify the
dimensionality of the parent table. Operations that would change the number of
rows (like `sample()`, `head()`, `tail()`, and `slice()`) will throw an error
with a message like "Cannot sample/take head/take tail/slice a table that has
nested tables. This would break the relationship between parent and child
tables."

This restriction exists because changing the parent table's dimensionality could
leave nested tables referencing rows that no longer exist. Instead, make sure to
finalize your parent table's structure before creating any nested tables.

:::

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

By default, `zip()` requires all arrays to have the same length. If the arrays
have different lengths, you must specify how to handle this using the `method`
option:

```js
// Loop shorter arrays
const table1 = stepper.new().zip(
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

// Pad with a specific value
const table2 = stepper.new().zip(
  {
    shape: ['circle', 'square'],
    color: ['red', 'green', 'blue'],
  },
  { method: 'pad', padValue: 'unknown' }
)
// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'square', color: 'green' },
//   { shape: 'unknown', color: 'blue' }
// ]

// Repeat the last value
const table3 = stepper.new().zip(
  {
    shape: ['circle', 'square'],
    color: ['red', 'green', 'blue'],
  },
  { method: 'last' }
)
// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'square', color: 'green' },
//   { shape: 'square', color: 'blue' }
// ]
```

::: warning Different Lengths

When using `zip()`, if the arrays have different lengths:

- By default, it will throw an error
- You must specify a `method` to handle the difference:
  - `'loop'`: Repeats the shorter array values
  - `'pad'`: Fills with a specified `padValue` (required)
  - `'last'`: Repeats the last value of each shorter array

:::

::: tip Non-Array Values

The `zip()` method can handle non-array values by treating them as
single-element arrays:

```js
const table = stepper.new().zip(
  {
    shape: 'circle', // Treated as ['circle']
    color: ['red', 'green', 'blue'],
  },
  { method: 'loop' }
)

// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'circle', color: 'green' },
//   { shape: 'circle', color: 'blue' }
// ]
```

:::

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

::: tip Non-Array Values

Like `zip()`, the `outer()` method can handle non-array values by treating them
as single-element arrays:

```js
const table = stepper.new().outer({
  shape: 'circle', // Treated as ['circle']
  color: ['red', 'green'],
})

// Results in:
// [
//   { shape: 'circle', color: 'red' },
//   { shape: 'circle', color: 'green' }
// ]
```

:::

#### Repeating Blocks of Trials

The `repeat()` method allows you to repeat all trials a specified number of
times, in order:

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

#### Creating Sequences with range()

The `range()` method allows you to create a sequence of trials with incrementing
index values. This is particularly useful when you need to create a series of
numbered trials or when you want to build a sequence that you'll modify later:

```js
const table = stepper.new().range(3)

// Results in:
// [
//   { range: 0 },
//   { range: 1 },
//   { range: 2 }
// ]
```

You can combine `range()` with other methods like `forEach()` to create more
complex sequences:

```js
const table = stepper
  .new()
  .range(2)
  .forEach((row) => ({
    ...row,
    condition: row.range % 2 === 0 ? 'A' : 'B',
  }))

// Results in:
// [
//   { range: 0, condition: 'A' },
//   { range: 1, condition: 'B' }
// ]
```

::: warning Positive Numbers Only

The `range()` method requires a positive integer as its argument. It will throw
an error if called with zero or a negative number.

:::

#### Printing Table Contents with print()

The `print()` method provides a convenient way to inspect the contents of your
trial table, including any nested tables. This is particularly useful during
development and debugging:

```js
const table = stepper.new().append([
  { shape: 'circle', color: 'red' },
  { shape: 'square', color: 'blue' },
])

table.print()
// Output:
// Table with 2 rows:
// [0]: { shape: 'circle', color: 'red' }
// [1]: { shape: 'square', color: 'blue' }
```

The `print()` method also handles nested tables with proper indentation:

```js
const trials = stepper.new().range(2)
trials[0].new().append([
  { type: 'stim', value: 1 },
  { type: 'feedback', value: 2 },
])
trials[1].new().append([{ type: 'stim', value: 3 }])

trials.print()
// Output:
// Table with 2 rows:
// [0]: { range: 0 }
//   Table with 2 rows:
//   [0]: { type: 'stim', value: 1 }
//   [1]: { type: 'feedback', value: 2 }
// [1]: { range: 1 }
//   Table with 1 rows:
//   [0]: { type: 'stim', value: 3 }
```

::: tip Method Chaining

The `print()` method returns the table object, allowing it to be chained with
other methods:

```js
const table = stepper
  .new()
  .append({ shape: 'circle' })
  .print() // Print current state
  .append({ shape: 'square' })
  .print() // Print updated state
```

:::

#### Interleaving Trials with interleave()

The `interleave()` method combines two sets of trials by alternating between
them. This is useful when you want to create a sequence that alternates between
different trial types:

```js
const table1 = stepper.new().append([
  { type: 'stim', id: 1 },
  { type: 'stim', id: 2 },
])

const table2 = stepper.new().append([
  { type: 'feedback', id: 3 },
  { type: 'feedback', id: 4 },
])

table1.interleave(table2)
// Results in:
// [
//   { type: 'stim', id: 1 },
//   { type: 'feedback', id: 3 },
//   { type: 'stim', id: 2 },
//   { type: 'feedback', id: 4 }
// ]
```

The method can handle tables of different lengths, arrays, or single objects:

```js
// Different length tables
const table1 = stepper.new().append([
  { type: 'stim', id: 1 },
  { type: 'stim', id: 2 },
  { type: 'stim', id: 3 },
])

const table2 = stepper.new().append([
  { type: 'feedback', id: 4 },
  { type: 'feedback', id: 5 },
])

table1.interleave(table2)
// Results in:
// [
//   { type: 'stim', id: 1 },
//   { type: 'feedback', id: 4 },
//   { type: 'stim', id: 2 },
//   { type: 'feedback', id: 5 },
//   { type: 'stim', id: 3 }
// ]

// Array input
table1.interleave([
  { type: 'feedback', id: 4 },
  { type: 'feedback', id: 5 },
])

// Single object
table1.interleave({ type: 'feedback', id: 4 })
```

::: warning Safety Limit

Like other table operations, `interleave()` has a safety limit of 5000 rows to
prevent accidentally creating too many trials. If the combined length would
exceed this limit, it will throw an error.

:::

::: tip Method Chaining

The `interleave()` method returns the table object, allowing it to be chained
with other methods:

```js
const table = stepper
  .new()
  .append([
    { type: 'stim', id: 1 },
    { type: 'stim', id: 2 },
  ])
  .interleave([
    { type: 'feedback', id: 3 },
    { type: 'feedback', id: 4 },
  ])
  .forEach((row) => ({ ...row, condition: 'test' }))
```

:::

#### Taking First or Last Elements with head() and tail()

The `head()` and `tail()` methods allow you to take a subset of trials from the
beginning or end of your trial table:

```js
// Take the first 3 trials
const headTable = stepper.new().range(5).head(3)

// Results in:
// [
//   { range: 0 },
//   { range: 1 },
//   { range: 2 }
// ]

// Take the last 3 trials
const tailTable = stepper.new().range(5).tail(3)

// Results in:
// [
//   { range: 2 },
//   { range: 3 },
//   { range: 4 }
// ]
```

Both methods maintain the original order of the trials. When using `tail()`, the
last n elements are returned in their original sequence (not reversed).

You can combine these methods with other operations:

```js
const table = stepper
  .new()
  .range(5)
  .tail(3)
  .forEach((row) => ({ ...row, condition: 'test' }))

// Results in:
// [
//   { range: 2, condition: 'test' },
//   { range: 3, condition: 'test' },
//   { range: 4, condition: 'test' }
// ]
```

::: warning Positive Numbers Only

Both `head()` and `tail()` require a positive integer as their argument. They
will throw an error if called with zero or a negative number.

:::

::: tip Handling Large n

If n is greater than the length of the trial table:

- `head(n)` will return all trials from the beginning
- `tail(n)` will return all trials from the end

In both cases, the original order of trials is preserved.

:::

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

#### Mapping Over Trials with map()

The `map()` method provides a simpler and more intuitive way to transform trials
compared to `forEach()`. It supports two styles of usage:

1. Using a regular function where `this` refers to the current row:

```js
const table = stepper
  .new()
  .append([
    { shape: 'circle', color: 'red' },
    { shape: 'square', color: 'green' },
  ])
  .map(function (index) {
    // 'this' refers to the current row
    return {
      ...this, // Important: spread the original properties to preserve them
      id: index,
      color: this.shape === 'circle' ? 'blue' : this.color,
    }
  })
```

2. Using an arrow function that receives the row as a parameter:

```js
const table = stepper
  .new()
  .append([
    { shape: 'circle', color: 'red' },
    { shape: 'square', color: 'green' },
  ])
  .map((row, index) => ({
    ...row, // Important: spread the original properties to preserve them
    id: index,
    color: row.shape === 'circle' ? 'blue' : row.color,
  }))
```

Both approaches result in:

```js
// [
//   { shape: 'circle', color: 'blue', id: 0 },
//   { shape: 'square', color: 'green', id: 1 }
// ]
```

::: tip Function Styles The `map()` method automatically detects which style
you're using based on the number of parameters in your function:

- If your function takes one parameter, it's treated as a regular function with
  `this` binding
- If your function takes two parameters, it's treated as an arrow function
  receiving `(row, index)`

Choose the style that best fits your coding preferences:

```js
// Style 1: Regular function with 'this'
table.map(function (index) {
  return { ...this, id: index }
})

// Style 2: Arrow function with row parameter
table.map((row, index) => ({ ...row, id: index }))
```

:::

::: warning Preserving Properties When returning a new object from your mapping
function, make sure to spread the original properties (`...this` or `...row`) if
you want to preserve them. Otherwise, they will be lost:

```js
// ❌ Original properties are lost
table.map((row, index) => ({ id: index }))

// ✅ Original properties are preserved
table.map((row, index) => ({ ...row, id: index }))
```

:::

::: tip Nested Tables Both styles support working with nested tables. With
regular functions use `this.new()`, with arrow functions use `row.new()`. Nested
tables are automatically preserved when you spread the original properties:

```js
// Using regular function
trials.map(function (index) {
  this.new().append([
    { type: 'stim', trial: index },
    { type: 'feedback', trial: index },
  ])
  return { ...this, block: Math.floor(index / 2) }
})

// Using arrow function
trials.map((row, index) => {
  row.new().append([
    { type: 'stim', trial: index },
    { type: 'feedback', trial: index },
  ])
  return { ...row, block: Math.floor(index / 2) }
})
```

:::

#### Shuffling Trials

The `shuffle()` method allows you to randomize the order of trials. This is
particularly useful for counterbalancing trial order across participants. The
shuffle operation respects the seeded random number generation system (see
[Randomization](/randomization) for more details).

```js
const table = stepper
  .new()
  .append([
    { shape: 'circle', color: 'red' },
    { shape: 'square', color: 'green' },
    { shape: 'triangle', color: 'blue' },
  ])
  .shuffle()

// Results in a randomly ordered array of the same trials
// The order will be deterministic based on the current seed
```

You can also provide a specific seed to the shuffle operation for custom
randomization:

```js
const table = stepper
  .new()
  .append([
    { shape: 'circle', color: 'red' },
    { shape: 'square', color: 'green' },
    { shape: 'triangle', color: 'blue' },
  ])
  .shuffle('custom-seed-123')

// Results in a deterministically ordered array based on the provided seed
```

::: tip Seeded Randomization

The shuffle operation uses the same seeded random number generation system as
the rest of Smile. When no seed is provided, it uses the current route-specific
seed (see [Randomization](/randomization) for details). This ensures that:

1. Each participant gets a unique but reproducible order
2. The order remains consistent if the page is refreshed
3. You can recreate any participant's exact trial order using their seed ID

:::

#### Sampling Trials

The `sample()` method provides various ways to sample from your trials, all of
which respect Smile's seeded randomization system (see
[Randomization](/randomization) for details). The method supports several
sampling types:

```js
const table = stepper.new().append([
  { id: 1, shape: 'circle', color: 'red' },
  { id: 2, shape: 'square', color: 'green' },
  { id: 3, shape: 'triangle', color: 'blue' },
  { id: 4, shape: 'star', color: 'yellow' },
])
```
