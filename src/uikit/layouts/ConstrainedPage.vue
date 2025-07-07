<script setup>
import { computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'

const api = useViewAPI()

const props = defineProps({
  class: {
    type: String,
    default: ''
  }
})

const containerClasses = computed(() => {
  const baseClasses = 'mx-auto select-none flex flex-col items-center mt-5'
  
  return [
    baseClasses,
    props.class
  ].filter(Boolean).join(' ')
})

const containerStyle = computed(() => {
  if (api.config.windowsizerRequest) {
    return {
      width: api.config.windowsizerRequest.width + 'px',
      minWidth: api.config.windowsizerRequest.width + 'px'
    }
  }
  return {}
})
</script>

<template>
  <div class="flex justify-center">
    <div
      :class="containerClasses"
      :style="containerStyle"
    >
      <slot />
    </div>
  </div>
</template>