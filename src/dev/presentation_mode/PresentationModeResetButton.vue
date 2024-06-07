<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
const props = defineProps(['icon'])
</script>

<template>
  <button
    class="button devbar-button has-tooltip-arrow has-tooltip-bottom"
    data-tooltip="Return to main page"
    @click="api.resetLocalState()"
  >
    <FAIcon icon="fa-solid fa-house" />
  </button>
</template>
