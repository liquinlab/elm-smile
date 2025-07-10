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

```vue
<Button>Default Button</Button>

<Button variant="destructive">Destructive Button</Button>

<Button variant="outline">Outline Button</Button>

<Button variant="secondary">Secondary Button</Button>

<Button variant="ghost">Ghost Button</Button>

<Button variant="link">Link Button</Button>
```

::: raw

<Button>Default Button</Button><br><br>

<Button variant="destructive">Destructive Button</Button><br><br>

<Button variant="outline">Outline Button</Button><br><br>

<Button variant="secondary">Secondary Button</Button><br><br>

<Button variant="ghost">Ghost Button</Button><br><br>

<Button variant="link">Link Button</Button><br><br>

:::

There are also many color variants controlled by the main Tailwind theme sheet
(`src/core/main.css`)/

```vue
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
```

::: raw

<Button variant="primary">Primary Button</Button><br><br>

<Button variant="primary-light">Primary Light Button</Button><br><br>

<Button variant="button-link">Button Link</Button><br><br>

<Button variant="button-link-light">Button Link Light</Button><br><br>

<Button variant="info">Info Button</Button><br><br>

<Button variant="info-light">Info Light Button</Button><br><br>

<Button variant="success">Success Button</Button><br><br>

<Button variant="success-light">Success Light Button</Button><br><br>

<Button variant="warning">Warning Button</Button><br><br>

<Button variant="warning-light">Warning Light Button</Button><br><br>

<Button variant="danger">Danger Button</Button><br><br>

<Button variant="danger-light">Danger Light Button</Button>

:::

There are also many sizes:

```vue
<Button size="xs">Extra Small Button</Button>

<Button size="sm">Small Button</Button>

<Button size="default">Default Button</Button>

<Button size="lg">Large Button</Button>

<Button size="xl">Extra Large Button</Button>

<Button size="icon">🔥</Button>

<Button size="menu">Menu Button</Button>
```

::: raw

<Button size="xs">Extra Small Button</Button><br><br>

<Button size="sm">Small Button</Button><br><br>

<Button size="default">Default Button</Button><br><br>

<Button size="lg">Large Button</Button><br><br>

<Button size="xl">Extra Large Button</Button><br><br>

<Button size="icon">🔥</Button><br><br>

<Button size="menu">Menu Button</Button>

:::

Buttons can include icons alongside text. Icons should ideally be placed before
the text content:

```vue
<Button>
  <i-lucide-plus />
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

```vue
<ButtonGroup>
  <ButtonGroupItem>Left</ButtonGroupItem>
  <ButtonGroupItem>Middle</ButtonGroupItem>
  <ButtonGroupItem>Right</ButtonGroupItem>
</ButtonGroup>
```

::: raw

<ButtonGroup>
  <ButtonGroupItem>Left</ButtonGroupItem>
  <ButtonGroupItem>Middle</ButtonGroupItem>
  <ButtonGroupItem>Right</ButtonGroupItem>
</ButtonGroup>

:::

```vue
<ButtonGroup variant="outline">
  <ButtonGroupItem>Option 1</ButtonGroupItem>
  <ButtonGroupItem>Option 2</ButtonGroupItem>
  <ButtonGroupItem>Option 3</ButtonGroupItem>
</ButtonGroup>
```

::: raw

<ButtonGroup variant="outline">
  <ButtonGroupItem>Option 1</ButtonGroupItem>
  <ButtonGroupItem>Option 2</ButtonGroupItem>
  <ButtonGroupItem>Option 3</ButtonGroupItem>
</ButtonGroup>

:::

ButtonGroup supports different sizes:

```vue
<ButtonGroup size="xs">
  <ButtonGroupItem>Extra Small</ButtonGroupItem>
  <ButtonGroupItem>XS</ButtonGroupItem>
  <ButtonGroupItem>Tiny</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup size="sm">
  <ButtonGroupItem>Small</ButtonGroupItem>
  <ButtonGroupItem>SM</ButtonGroupItem>
  <ButtonGroupItem>Compact</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup size="default">
  <ButtonGroupItem>Default</ButtonGroupItem>
  <ButtonGroupItem>Normal</ButtonGroupItem>
  <ButtonGroupItem>Regular</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup size="lg">
  <ButtonGroupItem>Large</ButtonGroupItem>
  <ButtonGroupItem>LG</ButtonGroupItem>
  <ButtonGroupItem>Big</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup size="xl">
  <ButtonGroupItem>Extra Large</ButtonGroupItem>
  <ButtonGroupItem>XL</ButtonGroupItem>
  <ButtonGroupItem>Huge</ButtonGroupItem>
</ButtonGroup>
```

::: raw

<ButtonGroup size="xs">
  <ButtonGroupItem>Extra Small</ButtonGroupItem>
  <ButtonGroupItem>XS</ButtonGroupItem>
  <ButtonGroupItem>Tiny</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<br>
<ButtonGroup size="sm">
  <ButtonGroupItem>Small</ButtonGroupItem>
  <ButtonGroupItem>SM</ButtonGroupItem>
  <ButtonGroupItem>Compact</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<br>
<ButtonGroup size="default"> <ButtonGroupItem>Default</ButtonGroupItem>
<ButtonGroupItem>Normal</ButtonGroupItem>
<ButtonGroupItem>Regular</ButtonGroupItem> </ButtonGroup>

:::

::: raw

<br>
<ButtonGroup size="lg">
  <ButtonGroupItem>Large</ButtonGroupItem>
  <ButtonGroupItem>LG</ButtonGroupItem>
  <ButtonGroupItem>Big</ButtonGroupItem>
</ButtonGroup>

:::

::: raw

<br>
<ButtonGroup size="xl">
  <ButtonGroupItem>Extra Large</ButtonGroupItem>
  <ButtonGroupItem>XL</ButtonGroupItem>
  <ButtonGroupItem>Huge</ButtonGroupItem>
</ButtonGroup>

:::

### Props

`variant` (string): The visual style variant (same as Button component)

`size` (string): The button size (same as Button component)

## Checkbox Component

The Checkbox component provides a standard checkbox input with various styling
options.

```vue
<Checkbox />

<Checkbox :modelValue="true" />

<Checkbox disabled />

<Checkbox :modelValue="true" disabled />
```

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

Checkbox supports different color variants:

```vue
<Checkbox variant="default" />

<Checkbox variant="primary" />

<Checkbox variant="info" />

<Checkbox variant="success" />

<Checkbox variant="warning" />

<Checkbox variant="danger" />
```

::: raw

<Checkbox variant="default" :modelValue="true"/>

<Checkbox variant="primary" :modelValue="true"/>

<Checkbox variant="info" :modelValue="true"/>

<Checkbox variant="success" :modelValue="true"/>

<Checkbox variant="warning" :modelValue="true"/>

<Checkbox variant="danger" :modelValue="true"/>

:::

Checkbox comes in different sizes:

```vue
<Checkbox size="xs" />

<Checkbox size="sm" />

<Checkbox size="default" />

<Checkbox size="lg" />

<Checkbox size="xl" />
```

::: raw

<Checkbox size="xs" :modelValue="true"/>

<Checkbox size="sm" :modelValue="true"/>

<Checkbox size="default" :modelValue="true"/>

<Checkbox size="lg" :modelValue="true"/>

<Checkbox size="xl" :modelValue="true"/>

:::

### Props

`modelValue` (boolean): The checked state (use v-model for two-way binding)

`variant` (string): The visual style variant can be `default`, `primary`,
`info`, `success`, `warning`, or `danger`.

`size` (string): The checkbox size can be `xs`, `sm`, `default`, `lg`, or `xl`.

`disabled` (boolean): Whether the checkbox is disabled

## Switch Component

The Switch component provides a toggle switch input, ideal for on/off states.

```vue
<Switch />

<Switch :modelValue="true" />

<Switch size="sm" />

<Switch size="lg" />

<Switch size="xl" />

<Switch disabled />

<Switch :modelValue="true" disabled />
```

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

Switch supports different color variants:

```vue
<Switch variant="primary" />

<Switch variant="info" />

<Switch variant="success" />

<Switch variant="warning" />

<Switch variant="danger" />
```

::: raw

<Switch variant="primary" :modelValue="true"/>

<Switch variant="info" :modelValue="true"/>

<Switch variant="success" :modelValue="true"/>

<Switch variant="warning" :modelValue="true"/>

<Switch variant="danger" :modelValue="true"/>

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

```vue
<Badge>Default Badge</Badge>

<Badge variant="secondary">Secondary Badge</Badge>

<Badge variant="destructive">Destructive Badge</Badge>

<Badge variant="outline">Outline Badge</Badge>
```

::: raw

<Badge>Default Badge</Badge>

<Badge variant="secondary">Secondary Badge</Badge>

<Badge variant="destructive">Destructive Badge</Badge>

<Badge variant="outline">Outline Badge</Badge>

:::

### Props

`variant` (string): The visual style variant can be `default`, `secondary`,
`destructive`, or `outline`.
