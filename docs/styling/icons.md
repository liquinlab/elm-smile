# Icons

This project uses the [Iconify](https://iconify.design/) package for icons.
Iconify provides access to over 100,000 icons from various icon libraries,
making it easy to find and use the perfect icon for your needs.

## How Iconify Works

Iconify is a universal icon framework that allows you to use icons from multiple
icon libraries with a single package. Instead of installing separate packages
for different icon sets, you can access icons from libraries like:

- **Lucide** - Modern, clean icons
- **Material Design Icons** - Google's design system icons
- **Feather Icons** - Simple, elegant icons
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Tabler Icons** - Over 4,000 customizable icons
- **And many more...**

## Finding Icons

The best way to find icons is through the
[Iconify Icon Sets](https://icon-sets.iconify.design/) website:

1. Visit [icon-sets.iconify.design](https://icon-sets.iconify.design/)
2. Browse by library or search for specific icons
3. Click on any icon to see its name and usage
4. Copy the icon name for use in your project

## Icon Naming Convention

Icons in this project use the following naming convention:

```
<i-{library}-{icon-name} />
```

### Examples:

```vue
<!-- Lucide icons -->
<i-lucide-home />
<i-lucide-settings />
<i-lucide-user />
<i-lucide-download />

<!-- Material Design icons -->
<i-mdi-account />
<i-mdi-cog />
<i-mdi-download />

<!-- Feather icons -->
<i-feather-home />
<i-feather-settings />
<i-feather-user />

<!-- Heroicons -->
<i-heroicons-home />
<i-heroicons-cog />
<i-heroicons-user />
```

## Popular Icon Libraries

### Lucide Icons

Modern, clean icons that are perfect for most use cases.

```vue
<i-lucide-home />
<i-lucide-settings />
<i-lucide-user />
<i-lucide-download />
<i-lucide-upload />
<i-lucide-edit />
<i-lucide-trash />
<i-lucide-plus />
<i-lucide-minus />
<i-lucide-check />
<i-lucide-x />
<i-lucide-search />
<i-lucide-heart />
<i-lucide-star />
<i-lucide-mail />
<i-lucide-phone />
<i-lucide-calendar />
<i-lucide-clock />
<i-lucide-map-pin />
<i-lucide-link />
```

### Material Design Icons

Google's comprehensive icon set with many variants.

```vue
<i-mdi-home />
<i-mdi-account />
<i-mdi-cog />
<i-mdi-download />
<i-mdi-upload />
<i-mdi-pencil />
<i-mdi-delete />
<i-mdi-plus />
<i-mdi-minus />
<i-mdi-check />
<i-mdi-close />
<i-mdi-magnify />
<i-mdi-heart />
<i-mdi-star />
<i-mdi-email />
<i-mdi-phone />
<i-mdi-calendar />
<i-mdi-clock />
<i-mdi-map-marker />
<i-mdi-link />
```

### Feather Icons

Simple, elegant icons with a consistent style.

```vue
<i-feather-home />
<i-feather-settings />
<i-feather-user />
<i-feather-download />
<i-feather-upload />
<i-feather-edit />
<i-feather-trash />
<i-feather-plus />
<i-feather-minus />
<i-feather-check />
<i-feather-x />
<i-feather-search />
<i-feather-heart />
<i-feather-star />
<i-feather-mail />
<i-feather-phone />
<i-feather-calendar />
<i-feather-clock />
<i-feather-map-pin />
<i-feather-link />
```

## Using Icons in Components

### Basic Usage

```vue
<template>
  <div>
    <i-lucide-home />
    <i-lucide-settings />
    <i-lucide-user />
  </div>
</template>
```

### Icons with Text

```vue
<template>
  <button>
    <i-lucide-plus />
    Add Item
  </button>
</template>
```

### Icons in Buttons

```vue
<template>
  <Button>
    <i-lucide-download />
    Download
  </Button>

  <Button variant="danger">
    <i-lucide-trash />
    Delete
  </Button>
</template>
```

### Icons with Styling

```vue
<template>
  <!-- Large icon -->
  <i-lucide-home class="w-8 h-8" />

  <!-- Colored icon -->
  <i-lucide-heart class="text-red-500" />

  <!-- Icon with hover effect -->
  <i-lucide-star
    class="text-gray-400 hover:text-yellow-400 transition-colors"
  />
</template>
```

## Icon Sizing

You can control icon size using Tailwind CSS classes:

```vue
<template>
  <!-- Extra small -->
  <i-lucide-home class="w-3 h-3" />

  <!-- Small -->
  <i-lucide-home class="w-4 h-4" />

  <!-- Default -->
  <i-lucide-home class="w-5 h-5" />

  <!-- Large -->
  <i-lucide-home class="w-6 h-6" />

  <!-- Extra large -->
  <i-lucide-home class="w-8 h-8" />
</template>
```

## Icon Colors

Icons inherit the text color by default, but you can customize them:

```vue
<template>
  <!-- Inherit text color -->
  <i-lucide-home />

  <!-- Specific color -->
  <i-lucide-heart class="text-red-500" />

  <!-- Multiple colors -->
  <i-lucide-star class="text-yellow-400" />
  <i-lucide-check class="text-green-500" />
  <i-lucide-alert-triangle class="text-orange-500" />
  <i-lucide-x class="text-red-500" />
</template>
```

## Common Icon Categories

### Navigation Icons

```vue
<i-lucide-home />
<i-lucide-settings />
<i-lucide-user />
<i-lucide-menu />
<i-lucide-chevron-left />
<i-lucide-chevron-right />
<i-lucide-arrow-left />
<i-lucide-arrow-right />
```

### Action Icons

```vue
<i-lucide-plus />
<i-lucide-minus />
<i-lucide-edit />
<i-lucide-trash />
<i-lucide-download />
<i-lucide-upload />
<i-lucide-save />
<i-lucide-refresh />
```

### Status Icons

```vue
<i-lucide-check />
<i-lucide-x />
<i-lucide-alert-triangle />
<i-lucide-info />
<i-lucide-heart />
<i-lucide-star />
<i-lucide-thumbs-up />
<i-lucide-thumbs-down />
```

### Communication Icons

```vue
<i-lucide-mail />
<i-lucide-phone />
<i-lucide-message-circle />
<i-lucide-bell />
<i-lucide-share />
<i-lucide-link />
<i-lucide-external-link />
```

## Best Practices

### 1. Choose the Right Library

- **Lucide**: Great for modern, clean interfaces
- **Material Design**: Good for comprehensive icon coverage
- **Feather**: Perfect for simple, elegant designs
- **Heroicons**: Excellent for web applications

### 2. Be Consistent

- Stick to one library per project when possible
- Use consistent sizing across similar contexts
- Maintain consistent color schemes

### 3. Accessibility

- Always provide meaningful text alternatives
- Use appropriate ARIA labels when needed
- Ensure sufficient color contrast

### 4. Performance

- Icons are loaded on-demand
- No need to import entire icon libraries
- Icons are cached after first use

## Finding the Right Icon

1. **Browse by Category**: Visit
   [icon-sets.iconify.design](https://icon-sets.iconify.design/) and browse by
   category
2. **Search by Name**: Use the search function to find specific icons
3. **Check Multiple Libraries**: If you don't find what you need in one library,
   try another
4. **Consider Context**: Choose icons that match your application's style and
   tone

## Icon Libraries Reference

| Library         | Prefix          | Description             |
| --------------- | --------------- | ----------------------- |
| Lucide          | `i-lucide-`     | Modern, clean icons     |
| Material Design | `i-mdi-`        | Google's design system  |
| Feather         | `i-feather-`    | Simple, elegant icons   |
| Heroicons       | `i-heroicons-`  | Hand-crafted SVG icons  |
| Tabler          | `i-tabler-`     | Customizable icons      |
| Carbon          | `i-carbon-`     | IBM's design system     |
| Ant Design      | `i-ant-design-` | Alibaba's design system |
| Bootstrap       | `i-bootstrap-`  | Bootstrap icons         |
| Font Awesome    | `i-fa-`         | Popular icon library    |

This icon system provides incredible flexibility while maintaining consistency
across your application. You can easily find and use any icon you need without
worrying about package dependencies or bundle size.
