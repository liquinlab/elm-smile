<script setup>
import StateTreeViewer from '@/dev/developer_mode/sidebar/StateTreeViewer.vue'
import ToggleStatus from '@/dev/developer_mode/sidebar/ToggleStatus.vue'
import DatabaseStatusInfo from '@/dev/developer_mode/sidebar/DatabaseStatusInfo.vue'
import RandomizationSidebarPanel from '@/dev/developer_mode/sidebar/RandomizationSidebarPanel.vue'
import StudyInfo from '@/dev/developer_mode/sidebar/StudyInfo.vue'
import ProgressSteps from '@/dev/developer_mode/sidebar/ProgressSteps.vue'

import useAPI from '@/core/composables/useAPI'
const api = useAPI()
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/uikit/components/ui/tabs'
</script>

<template>
  <div class="sidebar-container">
    <div class="sidebar-content">
      <Tabs v-model="api.store.dev.sideBarTab" class="w-full border-t border-border py-2">
        <TabsList class="mx-auto text-xs">
          <TabsTrigger value="steps" class="text-[0.75rem] font-mono"> Steps </TabsTrigger>
          <TabsTrigger value="randomization" class="text-[0.75rem] font-mono"> Random </TabsTrigger>
          <TabsTrigger value="db" class="text-[0.75rem] font-mono"> Info </TabsTrigger>
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

    <div class="sidebar-footer">
      <ToggleStatus />
      <ProgressSteps />
      <StudyInfo />
    </div>
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
