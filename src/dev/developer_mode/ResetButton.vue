<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
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
