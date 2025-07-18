<script setup>
import StepExplorerPanel from '@/dev/developer_mode/sidebar/StepExplorerPanel.vue'
import ConfigurationVariablesPanel from '@/dev/developer_mode/sidebar/ConfigurationVariablesPanel.vue'
import DatabaseStatusInfoPanel from '@/dev/developer_mode/sidebar/DatabaseStatusInfoPanel.vue'
import RandomizationSidebarPanel from '@/dev/developer_mode/sidebar/RandomizationSidebarPanel.vue'
import StudyInfoPanel from '@/dev/developer_mode/sidebar/StudyInfoPanel.vue'
import AppProgressPanel from '@/dev/developer_mode/sidebar/AppProgressPanel.vue'

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
          <StepExplorerPanel />
        </TabsContent>
        <TabsContent value="randomization">
          <RandomizationSidebarPanel />
        </TabsContent>
        <TabsContent value="db">
          <DatabaseStatusInfoPanel />
        </TabsContent>
      </Tabs>
    </div>

    <div class="sidebar-footer">
      <ConfigurationVariablesPanel />
      <AppProgressPanel />
      <StudyInfoPanel />
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
