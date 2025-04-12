<script setup>
import useAPI from '@/core/composables/useAPI'
import { computed } from 'vue'

const api = useAPI()

const currentState = computed(() => {
  const sideBar = api.store.dev.showSideBar
  const consoleBar = api.store.dev.showConsoleBar

  if (sideBar && consoleBar) return 'both'
  if (!sideBar && !consoleBar) return 'none'
  if (sideBar) return 'sidebar'
  return 'console'
})

const cycleState = () => {
  switch (currentState.value) {
    case 'both':
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = false
      break
    case 'none':
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = false
      break
    case 'sidebar':
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = true
      break
    case 'console':
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = true
      break
  }
}
</script>

<template>
  <button
    class="button devbar-button has-tooltip-arrow has-tooltip-left"
    :data-tooltip="
      currentState === 'both'
        ? 'Both panels visible'
        : currentState === 'none'
          ? 'Both panels hidden'
          : currentState === 'sidebar'
            ? 'Sidebar visible'
            : 'Console visible'
    "
    @click="cycleState"
  >
    <!-- Both panels visible -->
    <svg
      v-if="currentState === 'both'"
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-panels-right-bottom-icon lucide-panels-right-bottom"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 15h12" />
      <path d="M15 3v18" />
    </svg>

    <!-- Both panels hidden -->
    <svg
      v-if="currentState === 'none'"
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-app-window-mac-icon lucide-app-window-mac"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="M6 8h.01" />
      <path d="M10 8h.01" />
      <path d="M14 8h.01" />
    </svg>

    <!-- Only sidebar visible -->
    <svg
      v-if="currentState === 'sidebar'"
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-panel-right-icon lucide-panel-right"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
    </svg>

    <!-- Only console visible -->
    <svg
      v-if="currentState === 'console'"
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-panel-bottom-icon lucide-panel-bottom"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 15h18" />
    </svg>
  </button>
</template>
