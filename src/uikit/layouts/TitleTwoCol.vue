<script setup>
import { computed } from 'vue'
import { getResponsiveWidthClasses } from './layoutUtils.js'

const props = defineProps({
  leftFirst: {
    type: Boolean,
    default: false,
    description: 'Whether left column should appear first on mobile (true) or right column should appear first (false)',
  },
  leftWidth: {
    type: String,
    default: 'w-1/3',
    description: 'Tailwind width class for the left column (e.g., w-1/3, w-1/2, w-2/5)',
  },
})

const leftColumnClasses = computed(() => {
  return getResponsiveWidthClasses(props.leftWidth)
})
</script>

<template>
  <div class="w-6/7 select-none mx-auto text-left my-10">
    <slot name="title" />

    <div class="mt-10 flex gap-6" :class="leftFirst ? 'flex-col @lg:flex-row' : 'flex-col-reverse @lg:flex-row'">
      <div :class="leftColumnClasses">
        <slot name="left" />
      </div>

      <div class="flex-1">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>
