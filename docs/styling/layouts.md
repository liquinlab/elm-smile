<script setup>
import TwoColBasicExample from '../examples/TwoColBasicExample.vue'
import TwoColBasicExampleRaw from '../examples/TwoColBasicExample.vue?raw'
import TitleTwoColLeftFirstExample from '../examples/TitleTwoColLeftFirstExample.vue'
import TitleTwoColLeftFirstExampleRaw from '../examples/TitleTwoColLeftFirstExample.vue?raw'
import TitleTwoColRightFirstExample from '../examples/TitleTwoColRightFirstExample.vue'
import TitleTwoColRightFirstExampleRaw from '../examples/TitleTwoColRightFirstExample.vue?raw'
import ConstrainedTaskWindowGhostExample from '../examples/ConstrainedTaskWindowGhostExample.vue'
import ConstrainedTaskWindowGhostExampleRaw from '../examples/ConstrainedTaskWindowGhostExample.vue?raw'
import ConstrainedTaskWindowGameExample from '../examples/ConstrainedTaskWindowGameExample.vue'
import ConstrainedTaskWindowGameExampleRaw from '../examples/ConstrainedTaskWindowGameExample.vue?raw'
import SimpleExample from '../examples/SimpleExample.vue'
import SimpleExampleRaw from '../examples/SimpleExample.vue?raw'
</script>

# Layouts

The UIKit provides several layout components to help structure your experiment
views consistently.

## TwoCol

A responsive two-column layout component that stacks columns vertically on
mobile and arranges them horizontally on larger screens.

### Props

- `leftFirst` - Boolean: Whether the left column appears first on mobile
  (default: false)
- `leftWidth` - String: Tailwind width class for the left column (default:
  'w-1/3')

### Example

```vue
<script setup>
import { TwoCol } from '@/uikit/layouts'
</script>

<template>
  <TwoCol leftWidth="w-1/2" leftFirst>
    <template #left>
      <!-- Left column content -->
    </template>
    <template #right>
      <!-- Right column content -->
    </template>
  </TwoCol>
</template>
```

::: raw

<ComponentViewer 
  name="TwoCol" 
  description="Responsive two-column layout with configurable left width" 
  :raw-code="TwoColBasicExampleRaw">

  <TwoColBasicExample />

</ComponentViewer>

:::

### Width Options

The `leftWidth` prop accepts any Tailwind width class:

- `w-1/4` - 25% width
- `w-1/3` - 33% width (default)
- `w-2/5` - 40% width
- `w-1/2` - 50% width
- `w-3/5` - 60% width
- `w-2/3` - 67% width
- `w-3/4` - 75% width

## TitleTwoCol

Similar to TwoCol but includes an additional title slot above the columns.

### Props

Same as TwoCol, plus:

- All TwoCol props
- Additional `title` slot for header content

### Usage

```vue
<TitleTwoCol leftWidth="w-1/3" leftFirst>
  <template #title>
    <h1>Page Title</h1>
    <p>Page description</p>
  </template>
  <template #left>
    <!-- Left column content -->
  </template>
  <template #right>
    <!-- Right column content -->
  </template>
</TitleTwoCol>
```

::: raw

<ComponentViewer name="TitleTwoCol" description="Two-column layout with title
section" :raw-code="TitleTwoColLeftFirstExampleRaw">

<TitleTwoColLeftFirstExample />
 
 
 </ComponentViewer>

:::

This show what happens when the right column is first.

::: raw

<ComponentViewer name="TitleTwoCol" description="Two-column layout with right
column first" :raw-code="TitleTwoColRightFirstExampleRaw">

<TitleTwoColRightFirstExample />

</ComponentViewer>

:::

## ConstrainedTaskWindow

A constrained task window is a layout component that is used to constrain the
task window to a certain width.

### Props

- `width` - String: Tailwind width class for the task window (default: 'w-1/2')

::: raw

<ComponentViewer name="ConstrainedTaskWindow" description="Constrained task
window with ghost variant and responsive UI"
:raw-code="ConstrainedTaskWindowGhostExampleRaw">

<ConstrainedTaskWindowGhostExample />
 
 </ComponentViewer>

:::

## File Path Example

Here's an example using the ComponentViewer with a file path to automatically
load and display the component code:

::: raw

<ComponentViewer name="SimpleExample" description="Simple example component with
automatic code loading" :raw-code="SimpleExampleRaw">

<SimpleExample />
 
</ComponentViewer>

:::

This shows the constrained task window with responsive UI disabled:

::: raw

<ComponentViewer name="ConstrainedTaskWindow" description="Constrained task
window with game variant and responsive UI disabled"
:raw-code="ConstrainedTaskWindowGameExampleRaw">

<ConstrainedTaskWindowGameExample />
 
</ComponentViewer>

:::
