<script setup>
import { computed } from 'vue'
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { Database, RefreshCw } from 'lucide-vue-next'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import CircleProgress from '@/dev/developer_mode/navbar/CircleProgress.vue'

// if in dev mode (which should always be true on this page), set known
// if not a known user

const database_tooltip = computed(() => {
  var msg = ''
  if (api.store.browserEphemeral.dbConnected == true) {
    msg += 'Database connected | '
  } else {
    msg += 'Database not connected | '
  }
  if (api.store.browserEphemeral.dbChanges == true) {
    msg += 'Unsynced data '
  } else {
    msg += 'Data in sync '
  }
  if (api.store.browserEphemeral.dbConnected == true) {
    msg += '| '
    msg += Math.round((api.store.browserPersisted.approxDataSize / 1048576) * 1000) / 1000 + '% data used'
  }
  return msg
})
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline">
          <i-ix-database-filled
            style="font-size: 2em"
            class="disconnected"
            :class="{ connected: api.store.browserEphemeral.dbConnected == true }"
          />

          <template v-if="!api.store.browserEphemeral.dbConnected">
            <RefreshCw class="has-text-grey" />
          </template>
          <template v-else-if="api.store.browserEphemeral.dbChanges && api.store.browserEphemeral.dbConnected">
            <RefreshCw class="outofsync" />
          </template>
          <template v-else>
            <RefreshCw class="insync" />
          </template>
          <template v-if="!api.store.browserEphemeral.dbConnected">
            <div class="mt-1">
              <CircleProgress
                :percentage="Math.round(api.store.browserPersisted.approxDataSize / 1048576) * 100"
                :size="12"
                :strokeWidth="40"
                slicecolor="#aaa"
                basecolor="#aaa"
              />
            </div>
          </template>
          <template v-else>
            <div class="mt-1">
              <CircleProgress
                :percentage="Math.round(api.store.browserPersisted.approxDataSize / 1048576) * 100"
                :size="12"
                :strokeWidth="40"
                slicecolor="hsl(var(--bulma-button-h), var(--bulma-button-s), calc(var(--bulma-button-background-l) + var(--bulma-button-background-l-delta)))"
                basecolor="var(--status-green)"
              />
            </div>
          </template>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {{ database_tooltip }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<style scoped>
.disconnected {
  color: var(--status-red);
}
.connected {
  color: var(--status-green);
}
.outofsync {
  color: var(--status-yellow);
}
.insync {
  color: var(--status-green);
}
.notconnected {
  color: var(--darker-grey);
}
</style>
