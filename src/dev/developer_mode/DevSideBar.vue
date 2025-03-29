<script setup>
import { computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
import StateTreeViewer from '@/dev/developer_mode/StateTreeViewer.vue'
const api = useAPI()
</script>

<template>
  <div class="sidebar">
    <StateTreeViewer />
  </div>
</template>

<style scoped>
.sidebar {
  border-left: var(--dev-bar-lines);
  height: 100%;
}
</style>
