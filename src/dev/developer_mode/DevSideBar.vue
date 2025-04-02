<script setup>
import StateTreeViewer from '@/dev/developer_mode/StateTreeViewer.vue'
import DatabaseInfoSidebarPanel from '@/dev/developer_mode/DatabaseInfoSidebarPanel.vue'
import RandomizationSidebarPanel from '@/dev/developer_mode/RandomizationSidebarPanel.vue'
</script>

<template>
  <div class="sidebar-container">
    <DatabaseInfoSidebarPanel />
    <RandomizationSidebarPanel />
    <StateTreeViewer />

    <div class="sidebar-footer"></div>
  </div>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #f1f3f3;
}

.sidebar-footer {
  border-top: 1px solid #e4e4e4;
  margin-top: auto;
}
/* DatabaseInfoSidebarPanel will take its natural height */
:deep(.tree-viewer-container),
:deep(.tree-viewer-container-empty) {
  flex: 1;
  min-height: 0; /* Important for flex child to shrink properly */
}
</style>
