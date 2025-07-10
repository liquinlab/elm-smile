<script setup>
import ButtonVariantsExample from '../examples/ButtonVariantsExample.vue'
import ButtonVariantsExampleRaw from '../examples/ButtonVariantsExample.vue?raw'
import ButtonColorVariantsExample from '../examples/ButtonColorVariantsExample.vue'
import ButtonColorVariantsExampleRaw from '../examples/ButtonColorVariantsExample.vue?raw'
import ButtonSizesExample from '../examples/ButtonSizesExample.vue'
import ButtonSizesExampleRaw from '../examples/ButtonSizesExample.vue?raw'
import ButtonIconsExample from '../examples/ButtonIconsExample.vue'
import ButtonIconsExampleRaw from '../examples/ButtonIconsExample.vue?raw'
import ButtonGroupExample from '../examples/ButtonGroupExample.vue'
import ButtonGroupExampleRaw from '../examples/ButtonGroupExample.vue?raw'
import ButtonGroupSizesExample from '../examples/ButtonGroupSizesExample.vue'
import ButtonGroupSizesExampleRaw from '../examples/ButtonGroupSizesExample.vue?raw'
import CheckboxExample from '../examples/CheckboxExample.vue'
import CheckboxExampleRaw from '../examples/CheckboxExample.vue?raw'
import SwitchExample from '../examples/SwitchExample.vue'
import SwitchExampleRaw from '../examples/SwitchExample.vue?raw'
import BadgeExample from '../examples/BadgeExample.vue'
import BadgeExampleRaw from '../examples/BadgeExample.vue?raw'


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

# UIKit Components

Smile provides a library of built-in lower level components which are styled and
themed to match the overall project. These components build on
[Radix-Vue](https://www.radix-vue.com/) and
[Shadcn-vue](https://www.shadcn-vue.com/) and help you quickly develop consisent
interfaces with themed colors, dark mode support, and a consistent look and
feel. We anticipate adding more here over time.

## Importing Components

All UIkit components can be imported from the `@/uikit/components` directory.
The full list of available components is in the file. Most are in fact imported
from [Shadcn-vue](https://www.shadcn-vue.com/) but some have been extended for
use in Smile and are documented here:

```javascript
import { Badge } from '@/uikit/components/badge'
import { Button } from '@/uikit/components/button'
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/button-group'
import { Checkbox } from '@/uikit/components/checkbox'
import { Switch } from '@/uikit/components/switch'
```

## Button Component

The Button component is the primary interactive element for user actions. It
supports various styles, sizes, and can include icons.

::: raw

<ComponentViewer 
  name="Button Variants" 
  description="Different visual styles for buttons" 
  :raw-code="ButtonVariantsExampleRaw"
  :responsive="false"
  height="150px"
  preview-classes="p-8">

  <ButtonVariantsExample />

</ComponentViewer>

:::

There are also many color variants controlled by the main Tailwind theme sheet
(`src/core/main.css`)/

::: raw

<ComponentViewer 
  name="Button Color Variants" 
  description="Themed color variants for buttons" 
  :raw-code="ButtonColorVariantsExampleRaw"
  :responsive="false"
  height="250px"
  preview-classes="p-8">

  <ButtonColorVariantsExample />

</ComponentViewer>

:::

There are also many sizes:

::: raw

<ComponentViewer 
  name="Button Sizes" 
  description="Different sizes for buttons" 
  :raw-code="ButtonSizesExampleRaw"
  :responsive="false"
  height="180px"
  preview-classes="p-8">

  <ButtonSizesExample />

</ComponentViewer>

:::

Buttons can include icons alongside text. Icons should ideally be placed before
the text content:

::: raw

<ComponentViewer 
  name="Buttons with Icons" 
  description="Buttons with various icons and variants" 
  :raw-code="ButtonIconsExampleRaw"
  :responsive="false"
  height="200px"
  preview-classes="p-8">

  <ButtonIconsExample />

</ComponentViewer>

:::

### Props

`variant` (string): The visual style variant can be `default`, `destructive`,
`outline`, `secondary`, `ghost`, `link`, `primary`, `primary-light`,
`button-link`, `button-link-light`, `info`, `info-light`, `success`,
`success-light`, `warning`, `warning-light`, `danger`, or `danger-light`.

`size` (string): The button size can be `icon` for icon-only buttons without
text or `menu` for menu-style buttons. Other standard sizes are also available.

## ButtonGroup Component

The ButtonGroup component creates a connected group of buttons, useful for
related actions or options.

::: raw

<ComponentViewer 
  name="ButtonGroup" 
  description="Connected group of buttons" 
  :raw-code="ButtonGroupExampleRaw"
  :responsive="false"
  height="220px"
  preview-classes="p-8">

  <ButtonGroupExample />

</ComponentViewer>

:::

ButtonGroup supports different sizes:

::: raw

<ComponentViewer 
  name="ButtonGroup Sizes" 
  description="Different sizes for button groups" 
  :raw-code="ButtonGroupSizesExampleRaw"
  :responsive="false"
  height="500px"
  preview-classes="p-8">

  <ButtonGroupSizesExample />

</ComponentViewer>

:::

### Props

`variant` (string): The visual style variant (same as Button component)

`size` (string): The button size (same as Button component)

## Checkbox Component

The Checkbox component provides a standard checkbox input with various styling
options.

::: raw

<ComponentViewer 
  name="Checkbox" 
  description="Checkbox component with variants, sizes, and states" 
  :raw-code="CheckboxExampleRaw"
  :responsive="false"
  height="250px"
  preview-classes="p-8">

  <CheckboxExample />

</ComponentViewer>

:::

### Props

`modelValue` (boolean): The checked state (use v-model for two-way binding)

`variant` (string): The visual style variant can be `default`, `primary`,
`info`, `success`, `warning`, or `danger`.

`size` (string): The checkbox size can be `xs`, `sm`, `default`, `lg`, or `xl`.

`disabled` (boolean): Whether the checkbox is disabled

## Switch Component

The Switch component provides a toggle switch input, ideal for on/off states.

::: raw

<ComponentViewer 
  name="Switch" 
  description="Switch component with variants, sizes, and states" 
  :raw-code="SwitchExampleRaw"
  :responsive="false"
  height="270px"
  preview-classes="p-8">

  <SwitchExample />

</ComponentViewer>

:::

### Props

`modelValue` (boolean): The checked state (use v-model for two-way binding)

`variant` (string): The visual style variant can be `default`, `primary`,
`info`, `success`, `warning`, or `danger`.

`size` (string): The switch size can be `sm`, `default`, `lg`, or `xl`.

`disabled` (boolean): Whether the switch is disabled

## Badge Component

The Badge component is used to display small pieces of information, such as
status indicators, labels, or counts.

::: raw

<ComponentViewer 
  name="Badge" 
  description="Badge component with different variants" 
  :raw-code="BadgeExampleRaw"
  :responsive="false"
  height="80px"
  preview-classes="p-8">

  <BadgeExample />

</ComponentViewer>

:::

### Props

`variant` (string): The visual style variant can be `default`, `secondary`,
`destructive`, or `outline`.

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
