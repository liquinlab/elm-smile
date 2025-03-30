<script setup>
import StateTreeViewer from '@/dev/developer_mode/StateTreeViewer.vue'
import DatabaseInfoSidebarPanel from '@/dev/developer_mode/DatabaseInfoSidebarPanel.vue'
</script>

<template>
  <div class="sidebar-container">
    <DatabaseInfoSidebarPanel />
    <StateTreeViewer />
  </div>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f1f3f3;
}

/* DatabaseInfoSidebarPanel will take its natural height */
:deep(.tree-viewer-container),
:deep(.tree-viewer-container-empty) {
  flex: 1;
  min-height: 0; /* Important for flex child to shrink properly */
}
</style>
