<script setup>
import useAPI from '@/core/composables/useAPI'
import ResponsiveDeviceSelect from './ResponsiveDeviceSelect.vue'
import { Label } from '@/uikit/components/ui/label'
import { Switch } from '@/uikit/components/ui/switch'
import { Button } from '@/uikit/components/ui/button'
import { Separator } from '@/uikit/components/ui/separator'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'
const api = useAPI()
const mode = useColorMode()

// Computed property to bind to the switch
const isDarkMode = computed({
  get: () => mode.value === 'dark',
  set: (value) => {
    mode.value = value ? 'dark' : 'light'
  },
})

// Reset developer mode settings to default
function resetDevState() {
  localStorage.removeItem(api.config.devLocalStorageKey) // delete the local store
  location.reload()
}
</script>
<template>
  <div class="grid gap-4">
    <div class="space-y-2">
      <h4 class="font-medium leading-none">Developer Configurations</h4>
      <p class="text-sm text-muted-foreground">Alter your developer mode settings.</p>
    </div>
    <div class="grid gap-2">
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="sidebar">Show Sidebar</Label>
        <Switch id="sidebar" v-model="api.store.dev.showSideBar" class="col-span-2" />
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="console">Show Console</Label>
        <Switch id="console" v-model="api.store.dev.showConsoleBar" class="col-span-2" />
      </div>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">Responsive Mode</span>
        </div>
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="width">Full screen</Label>
        <Switch id="width" v-model="api.store.dev.isFullscreen" class="col-span-2" />
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="maxWidth">Rotate</Label>
        <Switch id="maxWidth" v-model="api.store.dev.isRotated" class="col-span-2" />
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="device">Target Device</Label>
        <div class="col-span-2">
          <ResponsiveDeviceSelect />
        </div>
      </div>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground">UI/UX</span>
        </div>
      </div>
      <div class="grid grid-cols-3 items-center gap-4">
        <Label for="maxHeight">Dark mode</Label>
        <Switch id="maxHeight" v-model="isDarkMode" class="col-span-2"> </Switch>
      </div>
    </div>
    <div class="flex justify-end">
      <Button variant="outline" size="sm" @click="resetDevState"> Reset to Default </Button>
    </div>
  </div>
</template>
