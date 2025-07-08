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
    <div class="flex gap-6" :class="leftFirst ? 'flex-col @xl:flex-row' : 'flex-col-reverse @xl:flex-row mb-10'">
      <div :class="leftColumnClasses">
        <slot name="left" />
      </div>
      <div class="flex-1" :class="leftFirst ? 'mb-10' : ''">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>
