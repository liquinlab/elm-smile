<script setup>
import { SelectLabel } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  for: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
})
</script>

<template>
  <SelectLabel data-slot="select-label" :class="cn('px-2 py-1.5 text-sm font-medium', props.class)">
    <slot />
  </SelectLabel>
</template>
