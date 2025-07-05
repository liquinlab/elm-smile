# Layouts

The UIKit provides several layout components to help structure your experiment views consistently.

## TwoCol

A responsive two-column layout component that stacks columns vertically on mobile and arranges them horizontally on larger screens.

### Props

- `leftFirst` - Boolean: Whether the left column appears first on mobile (default: false)
- `leftWidth` - String: Tailwind width class for the left column (default: 'w-1/3')

### Usage

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

### Interactive Example

<script setup>
import ComponentViewer from '../.vitepress/theme/components/ComponentViewer.vue'
import TwoColExample from '../.vitepress/theme/components/examples/TwoColExample.vue'

const twoColCode = `<script setup>
import { TwoCol } from '@/uikit/layouts'
import { ref } from 'vue'

const leftWidth = ref('w-1/3')
<\/script>

<template>
  <TwoCol :left-width="leftWidth" left-first>
    <template #left>
      <div class="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">Left Column<\/h3>
        <p class="text-sm">
          This column's width is controlled by the leftWidth prop.
        <\/p>
      <\/div>
    <\/template>
    <template #right>
      <div class="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">Right Column<\/h3>
        <p class="text-sm">
          This column takes up the remaining space.
        <\/p>
      <\/div>
    <\/template>
  <\/TwoCol>
<\/template>`
</script>

<ComponentViewer 
  name="TwoCol"
  description="Responsive two-column layout with configurable left width"
  :code="twoColCode"
  :component="TwoColExample"
/>

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
