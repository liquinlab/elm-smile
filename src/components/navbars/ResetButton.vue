<script setup>
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()
</script>

<template>
  <button
    class="button devbar-button has-tooltip-arrow has-tooltip-bottom"
    data-tooltip="Reset entire state"
    @click="api.resetLocalState()"
  >
    <FAIcon icon="fa-solid fa-arrow-rotate-left" />
  </button>
</template>
