<script setup>
import StateTreeViewer from '@/dev/developer_mode/StateTreeViewer.vue'
import DatabaseInfoSidebarPanel from '@/dev/developer_mode/DatabaseInfoSidebarPanel.vue'
</script>

<template>
  <div class="sidebar">
    <DatabaseInfoSidebarPanel />
    <StateTreeViewer />
  </div>
</template>

<style scoped>
.sidebar {
  border-left: var(--dev-bar-lines);
  height: 100%;
  background-color: var(--dev-bar-background);
}
</style>
