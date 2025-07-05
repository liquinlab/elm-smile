<script setup>
import {
  Plus,
  Download,
  Check,
  AlertTriangle,
  Trash,
  Info,
  Settings,
  Edit,
  Heart,
  ThumbsUp,
  Clock,
  X,
  HelpCircle,
} from 'lucide-vue-next'
</script>

# Buttons

## Badge Examples

Here are examples of using our uikit Badge component:

::: raw

<Badge>Default Badge</Badge>

<Badge variant="secondary">Secondary Badge</Badge>

<Badge variant="destructive">Destructive Badge</Badge>

<Badge variant="outline">Outline Badge</Badge>

:::

## Button Examples

Here's an example of using our uikit Button component:

### Standard Variants

::: raw

<Button>Default Button</Button>

<Button variant="destructive">Destructive Button</Button>

<Button variant="outline">Outline Button</Button>

<Button variant="secondary">Secondary Button</Button>

<Button variant="ghost">Ghost Button</Button>

<Button variant="link">Link Button</Button>

:::

### New Color Variants

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

### Size Examples with Different Variants

::: raw

<Button variant="primary" size="xs">Primary XS</Button>

<Button variant="success" size="sm">Success SM</Button>

<Button variant="warning" size="default">Warning Default</Button>

<Button variant="danger" size="lg">Danger LG</Button>

<Button variant="info" size="xl">Info XL</Button>

<Button variant="primary" size="icon">ℹ️</Button>

:::

### Buttons with Icons

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

::: raw

<Button variant="primary" size="icon"><Plus /></Button>

<Button variant="success" size="icon"><Check /></Button>

<Button variant="warning" size="icon"><AlertTriangle /></Button>

<Button variant="danger" size="icon"><Trash /></Button>

<Button variant="info" size="icon"><Info /></Button>

<Button variant="outline" size="icon"><Settings /></Button>

<Button variant="ghost" size="icon"><Edit /></Button>

:::

### Light Variants with Icons

::: raw

<Button variant="primary-light"><Heart />Like</Button>

<Button variant="success-light"><ThumbsUp />Approve</Button>

<Button variant="warning-light"><Clock />Pending</Button>

<Button variant="danger-light"><X />Cancel</Button>

<Button variant="info-light"><HelpCircle />Help</Button>

:::

## Button Group Examples

Here are examples of using our uikit ButtonGroup component:

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

### Button Group Variants with Sizes

::: raw

<ButtonGroup variant="outline" size="sm">
  <ButtonGroupItem>Small</ButtonGroupItem>
  <ButtonGroupItem>Outline</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="outline" size="lg">
  <ButtonGroupItem>Large</ButtonGroupItem>
  <ButtonGroupItem>Outline</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="outline" size="xl">
  <ButtonGroupItem>Extra Large</ButtonGroupItem>
  <ButtonGroupItem>Outline</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

### Button Group Color Variants

::: raw

<ButtonGroup variant="primary">
  <ButtonGroupItem>Primary</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="primary-light">
  <ButtonGroupItem>Primary Light</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="info">
  <ButtonGroupItem>Info</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="info-light">
  <ButtonGroupItem>Info Light</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="success">
  <ButtonGroupItem>Success</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="success-light">
  <ButtonGroupItem>Success Light</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="warning">
  <ButtonGroupItem>Warning</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="warning-light">
  <ButtonGroupItem>Warning Light</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="danger">
  <ButtonGroupItem>Danger</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="danger-light">
  <ButtonGroupItem>Danger Light</ButtonGroupItem>
  <ButtonGroupItem>Button</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

### Button Group Combined Examples

::: raw

<ButtonGroup variant="primary" size="sm">
  <ButtonGroupItem>Primary</ButtonGroupItem>
  <ButtonGroupItem>Small</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="success-light" size="lg">
  <ButtonGroupItem>Success Light</ButtonGroupItem>
  <ButtonGroupItem>Large</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="warning" size="xs">
  <ButtonGroupItem>Warning</ButtonGroupItem>
  <ButtonGroupItem>Extra Small</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<ButtonGroup variant="info" size="xl">
  <ButtonGroupItem>Info</ButtonGroupItem>
  <ButtonGroupItem>Extra Large</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

:::

## Checkbox Examples

Here are examples of using our uikit Checkbox component:

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

### Checkbox Color Variants - Unchecked

::: raw

<Checkbox variant="default" />

<Checkbox variant="primary" />

<Checkbox variant="info" />

<Checkbox variant="success" />

<Checkbox variant="warning" />

<Checkbox variant="danger" />

:::

### Checkbox Color Variants - Checked

::: raw

<Checkbox variant="default" :modelValue="true" />

<Checkbox variant="primary" :modelValue="true" />

<Checkbox variant="info" :modelValue="true" />

<Checkbox variant="success" :modelValue="true" />

<Checkbox variant="warning" :modelValue="true" />

<Checkbox variant="danger" :modelValue="true" />

:::

### Checkbox Sizes

::: raw

<Checkbox size="xs" />

<Checkbox size="sm" />

<Checkbox size="default" />

<Checkbox size="lg" />

<Checkbox size="xl" />

:::

### Checkbox Sizes - Checked

::: raw

<Checkbox size="xs" :modelValue="true" />

<Checkbox size="sm" :modelValue="true" />

<Checkbox size="default" :modelValue="true" />

<Checkbox size="lg" :modelValue="true" />

<Checkbox size="xl" :modelValue="true" />

:::

### Checkbox Size and Variant Combinations

::: raw

<Checkbox variant="primary" size="xs" :modelValue="true" />

<Checkbox variant="info" size="sm" :modelValue="true" />

<Checkbox variant="success" size="default" :modelValue="true" />

<Checkbox variant="warning" size="lg" :modelValue="true" />

<Checkbox variant="danger" size="xl" :modelValue="true" />

:::

### Checkbox Color Variants - Disabled States

::: raw

<Checkbox variant="default" disabled />

<Checkbox variant="default" :modelValue="true" disabled />

<Checkbox variant="primary" disabled />

<Checkbox variant="primary" :modelValue="true" disabled />

<Checkbox variant="success" disabled />

<Checkbox variant="success" :modelValue="true" disabled />

<Checkbox variant="danger" disabled />

<Checkbox variant="danger" :modelValue="true" disabled />

:::

## Switch Examples

Here are examples of using our uikit Switch component:

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

### Switch Color Variants - Unchecked

::: raw

<Switch variant="primary" />

<Switch variant="info" />

<Switch variant="success" />

<Switch variant="warning" />

<Switch variant="danger" />

:::

### Switch Color Variants - Checked

::: raw

<Switch variant="primary" :modelValue="true" />

<Switch variant="info" :modelValue="true" />

<Switch variant="success" :modelValue="true" />

<Switch variant="warning" :modelValue="true" />

<Switch variant="danger" :modelValue="true" />

:::

### Switch Color Variants - Different Sizes

::: raw

<Switch variant="primary" size="sm" :modelValue="true" />

<Switch variant="info" size="default" :modelValue="true" />

<Switch variant="success" size="lg" :modelValue="true" />

<Switch variant="warning" size="xl" :modelValue="true" />

<Switch variant="danger" size="xl" :modelValue="true" />

:::

### Switch Color Variants - Disabled States

::: raw

<Switch variant="primary" disabled />

<Switch variant="primary" :modelValue="true" disabled />

<Switch variant="success" disabled />

<Switch variant="success" :modelValue="true" disabled />

<Switch variant="danger" disabled />

<Switch variant="danger" :modelValue="true" disabled />

:::
