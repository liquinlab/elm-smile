<script setup>
import DocsDropDown from '@/dev/developer_mode/DocsDropDown.vue'
import Stepper from '@/dev/developer_mode/Stepper.vue'
import RouteInfoButton from '@/dev/developer_mode/RouteInfoButton.vue'
import ResetButton from '@/dev/developer_mode/ResetButton.vue'
import ReloadButton from '@/dev/developer_mode/ReloadButton.vue'
import DataBarButton from '@/dev/developer_mode/DataBarButton.vue'
import ViewButton from '@/dev/developer_mode/ViewButton.vue'
import { BugPlay } from 'lucide-vue-next'
import useAPI from '@/core/composables/useAPI'
import KeyCommandNotification from '@/dev/developer_mode/KeyCommandNotification.vue'

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
 * - Ctrl+2: Cycle through console tabs (Browse -> Log -> Config)
 * - Ctrl+3: Reset local state
 * - Ctrl+4: Connect to database
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

    const currentTab = api.store.dev.consoleBarTab

    if (currentTab === 'browse') {
      api.store.dev.consoleBarTab = 'log'
      if (api.store.dev.showConsoleBar) {
        showTemporaryNotification('Ctrl + 2', 'Switched to Log Tab')
      }
    } else if (currentTab === 'log') {
      api.store.dev.consoleBarTab = 'config'
      if (api.store.dev.showConsoleBar) {
        showTemporaryNotification('Ctrl + 2', 'Switched to Config Tab')
      }
    } else {
      api.store.dev.consoleBarTab = 'browse'
      if (api.store.dev.showConsoleBar) {
        showTemporaryNotification('Ctrl + 2', 'Switched to Browse Tab')
      }
    }
  }
})

// Add shortcut for resetting local state
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '3') {
    e.preventDefault()
    showTemporaryNotification('Ctrl + 3', 'Resetting Local State')
    setTimeout(() => {
      api.resetLocalState()
    }, 200)
  }
})

// Add shortcut for connecting to database
onKeyDown((e) => {
  if (e.ctrlKey && e.key === '4') {
    e.preventDefault()
    if (!api.store.browserPersisted.knownUser) {
      api.setKnown()
      api.setConsented()
      showTemporaryNotification('Ctrl + 4', 'Connected to Database')
    }
  }
})

/**
 * Shows a temporary notification with a command and action that automatically hides after 1.5 seconds
 *
 * @param {string} command - The command text to display in the notification
 * @param {string} action - The action text to display in the notification
 *
 * Sets the notification content and shows it by updating reactive refs:
 * - notificationCommand
 * - notificationAction
 * - showNotification
 *
 * Uses setTimeout to automatically hide the notification after 1.5 seconds
 */
const showTemporaryNotification = (command, action) => {
  notificationCommand.value = command
  notificationAction.value = action
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 1500) // Hide after 1.5 seconds
}

// Add notification state
const showNotification = ref(false)
const notificationCommand = ref('')
const notificationAction = ref('')
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
          <div class="flex items-center text-xs font-semibold"><BugPlay class="size-4 mr-1" /><b>DEV</b></div>
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

        <!-- database info button -->
        <DataBarButton></DataBarButton>

        <!-- responsive hides this if the page is too small-->
        <div class="items-center">
          <Stepper></Stepper>
        </div>

        <!-- route info buttons -->
        <div class="hidden md:flex items-center">
          <RouteInfoButton></RouteInfoButton>
        </div>

        <!-- view button -->
        <div class="flex items-center">
          <ViewButton></ViewButton>
        </div>
      </div>
    </div>
  </nav>
  <KeyCommandNotification :show="showNotification" :command="notificationCommand" :action="notificationAction" />
</template>

<style scoped>
a:hover {
  color: #10dffa;
}

/* Keep any custom styles that might be needed for child components */
</style>
