# UIKit Components

Smile provides a library of built-in lower level components which are styled and
themed to match the overall project. These components build on
[Radix-Vue](https://www.radix-vue.com/) and
[Shadcn-vue](https://www.shadcn-vue.com/) and help you quickly develop consisent
interfaces with themed colors, dark mode support, and a consistent look and
feel.

## Importing Components

All UIkit components can be imported from the `@/uikit/components` directory:

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

### Props

- `variant` (string): The visual style variant

  - `default`: Standard button appearance
  - `destructive`: Error or dangerous action style
  - `outline`: Outlined style with border
  - `secondary`: Muted secondary style
  - `ghost`: Minimal style with hover effects
  - `link`: Link-like appearance
  - `primary`: Primary action style
  - `primary-light`: Light primary style
  - `button-link`: Button that looks like a link
  - `button-link-light`: Light button-link style
  - `info`: Informational style
  - `info-light`: Light informational style
  - `success`: Success action style
  - `success-light`: Light success style
  - `warning`: Warning action style
  - `warning-light`: Light warning style
  - `danger`: Dangerous action style
  - `danger-light`: Light dangerous style

- `size` (string): The button size
  - `xs`: Extra small (12px padding)
  - `sm`: Small (16px padding)
  - `default`: Default size (20px padding)
  - `lg`: Large (24px padding)
  - `xl`: Extra large (32px padding)
  - `icon`: Icon-only button
  - `menu`: Menu-style button

### Standard Variants

::: raw

<Button>Default Button</Button>

<Button variant="destructive">Destructive Button</Button>

<Button variant="outline">Outline Button</Button>

<Button variant="secondary">Secondary Button</Button>

<Button variant="ghost">Ghost Button</Button>

<Button variant="link">Link Button</Button>

:::

### Color Variants

::: raw

<Button variant="primary">Primary Button</Button>

<Button variant="primary-light">Primary Light Button</Button>

<Button variant="button-link">Button Link</Button>

<Button variant="button-link-light">Button Link Light</Button>

<Button variant="info">Info Button</Button>

<Button variant="info-light">Info Light Button</Button>

<Button variant="success">Success Button</Button>

<Button variant="success-light">Success Light Button</Button>

<Button variant="warning">Warning Button</Button>

<Button variant="warning-light">Warning Light Button</Button>

<Button variant="danger">Danger Button</Button>

<Button variant="danger-light">Danger Light Button</Button>

:::

### Button Sizes

::: raw

<Button size="xs">Extra Small Button</Button>

<Button size="sm">Small Button</Button>

<Button size="default">Default Button</Button>

<Button size="lg">Large Button</Button>

<Button size="xl">Extra Large Button</Button>

<Button size="icon">🔥</Button>

<Button size="menu">Menu Button</Button>

:::

### Buttons with Icons

Buttons can include icons alongside text. Icons should be placed before the text
content:

```vue
<Button>
  <Plus />
  Add Item
</Button>
```

::: raw

<Button><Plus />Add Item</Button>

<Button variant="primary"><Download />Download</Button>

<Button variant="success"><Check />Complete</Button>

<Button variant="warning"><AlertTriangle />Warning</Button>

<Button variant="danger"><Trash />Delete</Button>

<Button variant="info"><Info />Info</Button>

<Button variant="outline"><Settings />Settings</Button>

<Button variant="ghost"><Edit />Edit</Button>

:::

### Icon-Only Buttons

For icon-only buttons, use the `icon` size:

```vue
<Button variant="primary" size="icon">
  <Plus />
</Button>
```

::: raw

<Button variant="primary" size="icon"><Plus /></Button>

<Button variant="success" size="icon"><Check /></Button>

<Button variant="warning" size="icon"><AlertTriangle /></Button>

<Button variant="danger" size="icon"><Trash /></Button>

<Button variant="info" size="icon"><Info /></Button>

<Button variant="outline" size="icon"><Settings /></Button>

<Button variant="ghost" size="icon"><Edit /></Button>

:::

### Common Use Cases

- **Primary Actions**: Use `variant="primary"` for main actions like "Submit",
  "Save", "Continue"
- **Secondary Actions**: Use `variant="secondary"` or `variant="outline"` for
  less important actions
- **Destructive Actions**: Use `variant="destructive"` or `variant="danger"` for
  delete/remove actions
- **Navigation**: Use `variant="ghost"` or `variant="link"` for navigation
  buttons
- **Status Actions**: Use color variants (`success`, `warning`, `info`) to
  indicate action outcomes

## ButtonGroup Component

The ButtonGroup component creates a connected group of buttons, useful for
related actions or options.

### Props

- `variant` (string): The visual style variant (same as Button component)
- `size` (string): The button size (same as Button component)

### Usage

ButtonGroup contains ButtonGroupItem components:

```vue
<ButtonGroup variant="outline">
  <ButtonGroupItem>Option 1</ButtonGroupItem>
  <ButtonGroupItem>Option 2</ButtonGroupItem>
  <ButtonGroupItem>Option 3</ButtonGroupItem>
</ButtonGroup>
```

### Examples

::: raw

<ButtonGroup>
  <ButtonGroupItem>Left</ButtonGroupItem>
  <ButtonGroupItem>Middle</ButtonGroupItem>
  <ButtonGroupItem>Right</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="outline">
  <ButtonGroupItem>Option 1</ButtonGroupItem>
  <ButtonGroupItem>Option 2</ButtonGroupItem>
  <ButtonGroupItem>Option 3</ButtonGroupItem>
</ButtonGroup>

:::

### Button Group Sizes

::: raw

<ButtonGroup size="xs">
  <ButtonGroupItem>Extra Small</ButtonGroupItem>
  <ButtonGroupItem>XS</ButtonGroupItem>
  <ButtonGroupItem>Tiny</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup size="sm">
  <ButtonGroupItem>Small</ButtonGroupItem>
  <ButtonGroupItem>SM</ButtonGroupItem>
  <ButtonGroupItem>Compact</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup size="default">
  <ButtonGroupItem>Default</ButtonGroupItem>
  <ButtonGroupItem>Normal</ButtonGroupItem>
  <ButtonGroupItem>Regular</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup size="lg">
  <ButtonGroupItem>Large</ButtonGroupItem>
  <ButtonGroupItem>LG</ButtonGroupItem>
  <ButtonGroupItem>Big</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup size="xl">
  <ButtonGroupItem>Extra Large</ButtonGroupItem>
  <ButtonGroupItem>XL</ButtonGroupItem>
  <ButtonGroupItem>Huge</ButtonGroupItem>
</ButtonGroup>

:::

### Common Use Cases

- **Filter Options**: Group related filter buttons together
- **View Toggle**: Switch between different view modes (list/grid, etc.)
- **Action Groups**: Group related actions (edit/delete, etc.)
- **Navigation**: Create tab-like navigation
- **Settings**: Group related settings options

## Checkbox Component

The Checkbox component provides a standard checkbox input with various styling
options.

### Props

- `modelValue` (boolean): The checked state (use v-model for two-way binding)
- `variant` (string): The visual style variant
  - `default`: Standard checkbox appearance
  - `primary`: Primary color theme
  - `info`: Informational color theme
  - `success`: Success color theme
  - `warning`: Warning color theme
  - `danger`: Danger color theme
- `size` (string): The checkbox size
  - `xs`: Extra small
  - `sm`: Small
  - `default`: Default size
  - `lg`: Large
  - `xl`: Extra large
- `disabled` (boolean): Whether the checkbox is disabled

### Usage

```vue
<template>
  <Checkbox v-model="isChecked" variant="primary" />
</template>

<script setup>
import { ref } from 'vue'
import { Checkbox } from '@/uikit/components/checkbox'

const isChecked = ref(false)
</script>
```

### Default Checkbox States

::: raw

<Checkbox />

:::

::: raw

<Checkbox :modelValue="true" />

:::

::: raw

<Checkbox disabled />

:::

::: raw

<Checkbox :modelValue="true" disabled />

:::

### Color Variants

::: raw

<Checkbox variant="default" />

<Checkbox variant="primary" />

<Checkbox variant="info" />

<Checkbox variant="success" />

<Checkbox variant="warning" />

<Checkbox variant="danger" />

:::

### Checkbox Sizes

::: raw

<Checkbox size="xs" />

<Checkbox size="sm" />

<Checkbox size="default" />

<Checkbox size="lg" />

<Checkbox size="xl" />

:::

### Common Use Cases

- **Form Inputs**: Standard form checkboxes for user input
- **Settings**: Toggle settings on/off
- **Selection**: Select multiple items from a list
- **Agreements**: Accept terms and conditions
- **Filters**: Enable/disable filters

## Switch Component

The Switch component provides a toggle switch input, ideal for on/off states.

### Props

- `modelValue` (boolean): The checked state (use v-model for two-way binding)
- `variant` (string): The visual style variant
  - `default`: Standard switch appearance
  - `primary`: Primary color theme
  - `info`: Informational color theme
  - `success`: Success color theme
  - `warning`: Warning color theme
  - `danger`: Danger color theme
- `size` (string): The switch size
  - `sm`: Small
  - `default`: Default size
  - `lg`: Large
  - `xl`: Extra large
- `disabled` (boolean): Whether the switch is disabled

### Usage

```vue
<template>
  <Switch v-model="isEnabled" variant="success" />
</template>

<script setup>
import { ref } from 'vue'
import { Switch } from '@/uikit/components/switch'

const isEnabled = ref(false)
</script>
```

### Switch Examples

::: raw

<Switch />

:::

::: raw

<Switch :modelValue="true" />

:::

::: raw

<Switch size="sm" />

:::

::: raw

<Switch size="lg" />

:::

::: raw

<Switch size="xl" />

:::

::: raw

<Switch disabled />

:::

::: raw

<Switch :modelValue="true" disabled />

:::

### Color Variants

::: raw

<Switch variant="primary" />

<Switch variant="info" />

<Switch variant="success" />

<Switch variant="warning" />

<Switch variant="danger" />

:::

### Common Use Cases

- **Feature Toggles**: Enable/disable features
- **Settings**: Toggle application settings
- **Notifications**: Turn notifications on/off
- **Dark Mode**: Switch between light/dark themes
- **Auto-save**: Enable/disable automatic saving

## Badge Component

The Badge component is used to display small pieces of information, such as
status indicators, labels, or counts.

### Props

- `variant` (string): The visual style variant
  - `default` (default): Standard badge appearance
  - `secondary`: Muted secondary style
  - `destructive`: Error or warning style
  - `outline`: Outlined style with border

### Usage Examples

::: raw

<Badge>Default Badge</Badge>

<Badge variant="secondary">Secondary Badge</Badge>

<Badge variant="destructive">Destructive Badge</Badge>

<Badge variant="outline">Outline Badge</Badge>

:::

### Common Use Cases

- **Status Indicators**: Show the current status of an item (e.g., "Active",
  "Pending", "Completed")
- **Labels**: Categorize content (e.g., "New", "Featured", "Beta")
- **Counts**: Display small numbers (e.g., notification counts, item counts)
- **Tags**: Mark items with descriptive labels

## Best Practices

### Component Selection

- **Use Badge** for small status indicators, labels, or counts
- **Use Button** for user actions and navigation
- **Use ButtonGroup** for related actions or options
- **Use Checkbox** for multiple choice selections
- **Use Switch** for on/off toggles

### Accessibility

- Always provide meaningful labels for interactive components
- Use appropriate ARIA attributes when needed
- Ensure sufficient color contrast
- Support keyboard navigation

### Styling Consistency

- Use the provided variants rather than custom styling
- Maintain consistent spacing and sizing
- Follow the established color scheme
- Use appropriate sizes for the context

### Performance

- Import only the components you need
- Use v-model for two-way data binding
- Avoid unnecessary re-renders by using proper Vue reactivity
