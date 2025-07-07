<script setup>
import { computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'

const api = useViewAPI()

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'ghost', 'game', 'outline'].includes(value),
  },
})

const containerClasses = computed(() => {
  const baseClasses = 'mx-auto m-2 rounded-xl select-none flex flex-col items-center justify-center'
  const variantClasses = {
    default: '',
    ghost: 'bg-muted',
    game: 'bg-green-100',
    outline: 'border-1 border-muted-foreground',
  }

  return [baseClasses, variantClasses[props.variant], props.class].filter(Boolean).join(' ')
})

const containerStyle = computed(() => {
  if (api.config.windowsizerRequest) {
    return {
      width: api.config.windowsizerRequest.width + 'px',
      height: api.config.windowsizerRequest.height + 'px',
      minWidth: api.config.windowsizerRequest.width + 'px',
      minHeight: api.config.windowsizerRequest.height + 'px',
    }
  }
  return {}
})
</script>

<template>
  <div class="flex justify-center mt-5">
    <div :class="containerClasses" :style="containerStyle">
      <slot />
    </div>
  </div>
</template>
