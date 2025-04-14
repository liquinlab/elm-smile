<script setup>
import { onMounted, watch, ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import DocsDropDown from '@/dev/developer_mode/DocsDropDown.vue'
import Stepper from '@/dev/developer_mode/Stepper.vue'
import RouteInfoButton from '@/dev/developer_mode/RouteInfoButton.vue'
import ResetButton from '@/dev/developer_mode/ResetButton.vue'
import DataBarButton from '@/dev/developer_mode/DataBarButton.vue'
import ViewButton from '@/dev/developer_mode/ViewButton.vue'

import useAPI from '@/core/composables/useAPI'
import { onKeyDown } from '@vueuse/core'

const api = useAPI()
const router = useRouter()

/**
 * Developer mode keyboard shortcuts
 * These shortcuts are only active when developer mode is enabled
 *
 * Navigation:
 * - ArrowUp: Go to previous view
 * - ArrowDown: Go to next view
 *
 * Panel Controls:
 * - Alt+1: Toggle sidebar/console panels
 * - Alt+2: Cycle through console tabs (Browse -> Log -> Config)
 * - Alt+3: Reset local state
 * - Alt+4: Connect to database
 */
onKeyDown(['ArrowUp'], (e) => {
  e.preventDefault()
  api.goToView(api.prevView()?.name, true)
})

onKeyDown(['ArrowDown'], (e) => {
  e.preventDefault()
  api.goToView(api.nextView()?.name, true)
})

// Modify Alt+1 handler
onKeyDown(['Alt', '1'], (e) => {
  e.preventDefault()

  const sideBar = api.store.dev.showSideBar
  const consoleBar = api.store.dev.showConsoleBar

  if (!sideBar && !consoleBar) {
    api.store.dev.showSideBar = true
    api.store.dev.showConsoleBar = false
    showTemporaryNotification('Alt + 1', 'Showing Sidebar')
  } else if (sideBar && !consoleBar) {
    api.store.dev.showSideBar = false
    api.store.dev.showConsoleBar = true
    showTemporaryNotification('Alt + 1', 'Showing Console')
  } else if (!sideBar && consoleBar) {
    api.store.dev.showSideBar = true
    api.store.dev.showConsoleBar = true
    showTemporaryNotification('Alt + 1', 'Showing Both Panels')
  } else {
    api.store.dev.showSideBar = false
    api.store.dev.showConsoleBar = false
    showTemporaryNotification('Alt + 1', 'Hiding All Panels')
  }
})

// Modify Alt+2 handler
onKeyDown(['Alt', '2'], (e) => {
  e.preventDefault()

  const currentTab = api.store.dev.consoleBarTab

  if (currentTab === 'browse') {
    api.store.dev.consoleBarTab = 'log'
    if (api.store.dev.showConsoleBar) {
      showTemporaryNotification('Alt + 2', 'Switched to Log Tab')
    }
  } else if (currentTab === 'log') {
    api.store.dev.consoleBarTab = 'config'
    if (api.store.dev.showConsoleBar) {
      showTemporaryNotification('Alt + 2', 'Switched to Config Tab')
    }
  } else {
    api.store.dev.consoleBarTab = 'browse'
    if (api.store.dev.showConsoleBar) {
      showTemporaryNotification('Alt + 2', 'Switched to Browse Tab')
    }
  }
})

// Add shortcut for resetting local state
onKeyDown(['Alt', '3'], (e) => {
  e.preventDefault()
  api.resetLocalState()
})

// Add shortcut for connecting to database
onKeyDown(['Alt', '4'], (e) => {
  e.preventDefault()
  if (!api.store.local.knownUser) {
    api.setKnown()
    api.setConsented()
    showTemporaryNotification('Alt + 4', 'Connected to Database')
  }
})
</script>

<template>
  <nav class="devbar">
    <div class="devbar-brand">
      <div class="devbar-title">
        <div class="devbar-fulltitle">👩‍💻&nbsp;<b>DEVELOPER MODE</b></div>
        <div class="devbar-subtitle">👩‍💻&nbsp;<b>DEV MODE</b></div>
      </div>
    </div>

    <div class="devbar-menu">
      <div class="devbar-start">
        <div class="devmode">
          <DocsDropDown></DocsDropDown>
        </div>
      </div>

      <div class="devbar-end">
        <div class="devbar-item devbar-buttonpanel">
          <div class="buttons">
            <!-- reset button -->
            <div class="devbar-resetbutton">
              <ResetButton></ResetButton>
            </div>

            <!-- database info button -->
            <DataBarButton></DataBarButton>
            <!-- responsive hides this if the page is too small-->
            <div class="devbar-stepper">
              <Stepper></Stepper>
            </div>
            <!-- route info buttons -->
            <div class="devbar-routeinfodropdown">
              <RouteInfoButton></RouteInfoButton>
            </div>

            <!-- view button -->
            <ViewButton></ViewButton>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style>
.devbar {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  position: relative;
  z-index: 1000;
}
.devbar-fulltitle {
  padding-top: 0px;
  font-size: 0.92em;
}

.devbar-subtitle {
  padding-top: 0px;
  padding-right: 20px;
  display: none;
  white-space: nowrap;
  font-size: 0.92em;
}

.devbar-menu {
  flex-grow: 1;
  flex-shrink: 0;
  align-items: stretch;
  display: flex;
  z-index: 999;
}

.devbar {
  font-size: 13px;
  background: var(--dev-bar-light-grey); /*rgb(63, 160, 149);*/
  color: var(--dev-bar-text);
  border-bottom: var(--dev-bar-lines);
  min-height: 32px;
  max-height: 32px;
}

.devbar-start {
  justify-content: flex-start;
  margin-inline-end: auto;
  display: flex;
  align-items: stretch;
  flex-shrink: 3;
}

@media screen and (max-width: 830px) {
  .devbar-start {
    display: none;
  }
}

.devbar-title {
  padding-top: 8px;
  font-weight: 500;
  padding-left: 10px;
}

.devbar-end {
  justify-content: flex-end;
  margin-inline-start: auto;
  display: flex;
  align-items: stretch;
}

.devbar-item {
  align-items: center;
  display: flex;
}

.devbar-buttonpanel {
  padding-top: 0px;
  padding-left: 10px;
  padding-right: 10px;
  border-left: var(--dev-bar-lines);
  background-color: var(--dev-bar-mild-grey); /*rgb(63, 160, 149);*/
}

.devbar-button {
  font-size: 0.65rem;
  height: 2em;
}

@media screen and (max-width: 725px) {
  .devbar-fulltitle {
    display: none;
  }
  .devbar-buttonpanel {
    border-left: none;
    background-color: #eeeeee; /*rgb(63, 160, 149);*/
  }
  .devbar {
    border-left: 0.01em solid #b5b5b5;
    background-color: #eeeeee; /*rgb(63, 160, 149);*/
  }
  .devbar-subtitle {
    display: inline;
  }
  .devbar-stepper {
    display: none;
  }
}

@media screen and (max-width: 520px) {
  .devbar-randomizationdropdown {
    display: none;
  }
}

@media screen and (max-width: 474px) {
  .devbar-routeinfodropdown {
    display: none;
  }
}
</style>

<style scoped>
a:hover {
  color: #10dffa;
}

.jumper {
  padding-top: 4px;
  background-color: #dddddd;
}

.navbar {
  font-size: 13px;
  background: #f7f7f7; /*rgb(63, 160, 149);*/
  color: #000;
  border-bottom: 0.01em solid #b5b5b5;
  height: 0px;
  padding: 0px;
  padding-left: 10px;
  margin: 0px;
  min-height: 32px;
  text-align: center;
}

.field {
  margin: 0px;
  margin-top: 3px;
}
.is-jump-bar {
  font-size: 0.65rem;
  height: 2em;
  margin: 0px;
}

.devmode-title {
  padding-top: 8px;
  font-weight: 500;
  padding-left: 10px;
}

.devmode {
  padding-top: 8px;
  font-weight: 400;
  padding-left: 10px;
}

.mainstate {
  padding-top: 8px;
  border-left: 0.01em solid #b5b5b5;
  background-color: #eeeeee; /*rgb(63, 160, 149);*/
}
</style>
