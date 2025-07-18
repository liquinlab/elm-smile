<script setup>
import StepInfoButtonGroup from '@/dev/developer_mode/navbar/StepInfoButtonGroup.vue'
import ViewInfoButtonGroup from '@/dev/developer_mode/navbar/ViewInfoButtonGroup.vue'
import ResetButton from '@/dev/developer_mode/navbar/ResetButton.vue'
import ReloadButton from '@/dev/developer_mode/navbar/ReloadButton.vue'
import ColorModeButton from '@/dev/developer_mode/navbar/ColorModeButton.vue'
import DatabaseButtonGroup from '@/dev/developer_mode/navbar/DatabaseButtonGroup.vue'
import FullScreenButton from '@/dev/developer_mode/navbar/FullScreenButton.vue'
import ViewButton from '@/dev/developer_mode/navbar/ViewButton.vue'
import { BugPlay } from 'lucide-vue-next'
import useAPI from '@/core/composables/useAPI'
import KeyCommandNotification from '@/dev/developer_mode/navbar/KeyCommandNotification.vue'

import { ref } from 'vue'

import { onKeyDown } from '@vueuse/core'

const api = useAPI()

/**
 * Developer mode keyboard shortcuts
 * These shortcuts are only active when developer mode is enabled
 *
 * Navigation:
 * - ArrowUp: Go to previous view
 * - ArrowDown: Go to next view
 *
 * Panel Controls:
 * - Ctrl+1: Toggle sidebar/console panels
 * - Ctrl+2: Cycle through sidebar tabs (Steps -> Random -> DB Info)
 * - Ctrl+3: Cycle through console tabs (Browse -> Log -> Config)
 * - Ctrl+R: Reset local state
 * - Ctrl+D: Connect to database
 * - Ctrl+A: Autofill current view (if available)
 * - Ctrl+P: Pin/unpin current route
 */
onKeyDown((e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    api.goToView(api.prevView()?.name, true)
  }
})

onKeyDown((e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    api.goToView(api.nextView()?.name, true)
  }
})

// Modify Ctrl+1 handler
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '1') {
    e.preventDefault()

    const sideBar = api.store.dev.showSideBar
    const consoleBar = api.store.dev.showConsoleBar

    if (!sideBar && !consoleBar) {
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = false
      showTemporaryNotification('Ctrl + 1', 'Showing Sidebar')
    } else if (sideBar && !consoleBar) {
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = true
      showTemporaryNotification('Ctrl + 1', 'Showing Console')
    } else if (!sideBar && consoleBar) {
      api.store.dev.showSideBar = true
      api.store.dev.showConsoleBar = true
      showTemporaryNotification('Ctrl + 1', 'Showing Both Panels')
    } else {
      api.store.dev.showSideBar = false
      api.store.dev.showConsoleBar = false
      showTemporaryNotification('Ctrl + 1', 'Hiding All Panels')
    }
  }
})

// Modify Ctrl+2 handler
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '2') {
    e.preventDefault()

    if (!api.store.dev.showSideBar) {
      showTemporaryNotification('Ctrl + 2', 'Sidebar is hidden', 'error')
      return
    }

    const currentTab = api.store.dev.sideBarTab

    if (currentTab === 'steps') {
      api.store.dev.sideBarTab = 'randomization'
      showTemporaryNotification('Ctrl + 2', 'Switched to Random Tab')
    } else if (currentTab === 'randomization') {
      api.store.dev.sideBarTab = 'db'
      showTemporaryNotification('Ctrl + 2', 'Switched to DB Info Tab')
    } else {
      api.store.dev.sideBarTab = 'steps'
      showTemporaryNotification('Ctrl + 2', 'Switched to Steps Tab')
    }
  }
})

// Modify Ctrl+3 handler
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '3') {
    e.preventDefault()

    if (!api.store.dev.showConsoleBar) {
      showTemporaryNotification('Ctrl + 3', 'Console is hidden', 'error')
      return
    }

    const currentTab = api.store.dev.consoleBarTab

    if (currentTab === 'browse') {
      api.store.dev.consoleBarTab = 'log'
      showTemporaryNotification('Ctrl + 3', 'Switched to Log Tab')
    } else if (currentTab === 'log') {
      api.store.dev.consoleBarTab = 'config'
      showTemporaryNotification('Ctrl + 3', 'Switched to Config Tab')
    } else {
      api.store.dev.consoleBarTab = 'browse'
      showTemporaryNotification('Ctrl + 3', 'Switched to Browse Tab')
    }
  }
})

// Add shortcut for resetting local state
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'r') {
    e.preventDefault()
    showTemporaryNotification('Ctrl + R', 'Resetting Local State')
    setTimeout(() => {
      api.resetLocalState()
    }, 200)
  }
})

// Add shortcut for connecting to database
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault()
    if (!api.store.browserPersisted.knownUser) {
      api.setKnown()
      api.setConsented()
      showTemporaryNotification('Ctrl + D', 'Connected to Database')
    }
  }
})

// Add shortcut for autofill
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'a') {
    e.preventDefault()
    if (api.hasAutofill()) {
      api.autofill()
      showTemporaryNotification('Ctrl + A', 'Autofilled Current View')
    } else {
      showTemporaryNotification('Ctrl + A', 'No Autofill Available', 'error')
    }
  }
})

// Add shortcut for pinning current route
onKeyDown((e) => {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault()
    const currentRoute = api.currentRouteName()
    const isCurrentlyPinned = api.store.dev.pinnedRoute === currentRoute

    if (isCurrentlyPinned) {
      api.store.dev.pinnedRoute = null
      showTemporaryNotification('Ctrl + P', 'Unpinned Route')
    } else {
      api.store.dev.pinnedRoute = currentRoute
      showTemporaryNotification('Ctrl + P', 'Pinned Current Route')
    }
  }
})

/**
 * Shows a temporary notification with a command and action that automatically hides after 1.5 seconds
 *
 * @param {string} command - The command text to display in the notification
 * @param {string} action - The action text to display in the notification
 * @param {string} type - The type of notification ('default' or 'error')
 *
 * Sets the notification content and shows it by updating reactive refs:
 * - notificationCommand
 * - notificationAction
 * - notificationType
 * - showNotification
 *
 * Uses setTimeout to automatically hide the notification after 1.5 seconds
 */
const showTemporaryNotification = (command, action, type = 'default') => {
  notificationCommand.value = command
  notificationAction.value = action
  notificationType.value = type
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 1500) // Hide after 1.5 seconds
}

// Add notification state
const showNotification = ref(false)
const notificationCommand = ref('')
const notificationAction = ref('')
const notificationType = ref('default')
</script>

<template>
  <nav class="flex items-center justify-between w-full border-b min-h-[36px] max-h-[36px] text-sm px-2">
    <!-- Left section - anchored to the left -->
    <div class="flex items-center flex-shrink-0 px-2 py-1 rounded">
      <div class="flex items-center">
        <div class="hidden sm:block">
          <div class="flex items-center text-xs font-normal"><BugPlay class="size-4 mr-1" /><b>DEVELOPER MODE</b></div>
        </div>
        <div class="block sm:hidden">
          <div class="flex items-center text-xs font-normal"><BugPlay class="size-4 mr-1" /><b>DEV</b></div>
        </div>
      </div>
    </div>

    <!-- Middle section - centered -->
    <div class="flex items-center justify-center flex-1 min-w-0 px-2 py-1 rounded">
      <div class="flex items-center space-x-2">
        <!-- Add any middle content here -->
        <div class="text-xs text-gray-600">
          <!-- Middle content placeholder -->
        </div>
      </div>
    </div>

    <!-- Right section - anchored to the right -->
    <div class="flex items-center flex-shrink-0 px-1 py-1 rounded">
      <div class="flex items-center space-x-2.5 border-gray-300 pl-4 rounded-l">
        <!-- reload button -->
        <div class="flex items-center">
          <ReloadButton></ReloadButton>
        </div>

        <!-- reset button -->
        <div class="flex items-center">
          <ResetButton></ResetButton>
        </div>

        <!-- color mode button -->
        <div class="flex items-center" v-if="api.store.dev.isFullscreen && api.currentRouteName() !== 'recruit'">
          <ColorModeButton></ColorModeButton>
        </div>

        <!--fullscreen button -->
        <div class="flex items-center" v-if="api.currentRouteName() !== 'recruit'">
          <FullScreenButton></FullScreenButton>
        </div>

        <!-- database info button -->
        <DatabaseButtonGroup></DatabaseButtonGroup>

        <!-- responsive hides this if the page is too small-->
        <!-- step info buttons -->
        <div class="items-center">
          <StepInfoButtonGroup></StepInfoButtonGroup>
        </div>

        <!-- view info buttons -->
        <div class="hidden md:flex items-center">
          <ViewInfoButtonGroup></ViewInfoButtonGroup>
        </div>

        <!-- view button -->
        <div class="flex items-center">
          <ViewButton></ViewButton>
        </div>
      </div>
    </div>
  </nav>
  <KeyCommandNotification
    :show="showNotification"
    :command="notificationCommand"
    :action="notificationAction"
    :type="notificationType"
  />
</template>

<style scoped>
a:hover {
  color: #10dffa;
}

/* Keep any custom styles that might be needed for child components */
</style>
