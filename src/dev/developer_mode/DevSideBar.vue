<script setup>
import StateTreeViewer from '@/dev/developer_mode/StateTreeViewer.vue'
import ToggleStatus from '@/dev/developer_mode/ToggleStatus.vue'
import DatabaseStatusInfo from '@/dev/developer_mode/DatabaseStatusInfo.vue'
import RandomizationSidebarPanel from '@/dev/developer_mode/RandomizationSidebarPanel.vue'
import StudyInfo from '@/dev/developer_mode/StudyInfo.vue'
import ProgressSteps from '@/dev/developer_mode/ProgressSteps.vue'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/uikit/components/ui/tabs'
</script>

<template>
  <div class="sidebar-container">
    <div class="sidebar-content">
      <div class="w-full bg-muted border-b border-border">
        <StudyInfo />
      </div>
      <ProgressSteps />
      <ToggleStatus />
      <Tabs default-value="steps" class="w-full border-t border-border py-2">
        <TabsList class="mx-auto text-xs">
          <TabsTrigger value="steps" class="text-[0.75rem] font-mono"> Steps </TabsTrigger>
          <TabsTrigger value="randomization" class="text-[0.75rem] font-mono"> Randomization </TabsTrigger>
          <TabsTrigger value="db" class="text-[0.75rem] font-mono"> DB </TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <StateTreeViewer />
        </TabsContent>
        <TabsContent value="randomization">
          <RandomizationSidebarPanel />
        </TabsContent>
        <TabsContent value="db">
          <DatabaseStatusInfo />
        </TabsContent>
      </Tabs>
    </div>

    <div class="sidebar-footer"></div>
  </div>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
}
</style>
