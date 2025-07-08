<script setup>
import { computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'

const api = useViewAPI()

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})

const containerClasses = computed(() => {
  const baseClasses = 'mx-auto select-none flex flex-col items-center mt-5 mb-10'

  return [baseClasses, props.class].filter(Boolean).join(' ')
})

const containerStyle = computed(() => {
  if (api.config.windowsizerRequest && !api.config.responsiveUI) {
    return {
      width: api.config.windowsizerRequest.width + 'px',
      minWidth: api.config.windowsizerRequest.width + 'px',
    }
  } else if (api.config.responsiveUI) {
    return {
      width: '90vw',
      height: api.config.windowsizerRequest.height + 'px',
      maxWidth: api.config.windowsizerRequest.width + 'px',
      maxHeight: api.config.windowsizerRequest.height + 'px',
    }
  }
  return {}
})
</script>

<template>
  <div class="flex justify-center">
    <div :class="containerClasses" :style="containerStyle">
      <slot />
    </div>
  </div>
</template>
