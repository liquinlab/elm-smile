<script setup>
import { ref, computed } from 'vue'
import { onKeyDown } from '@vueuse/core'

// load sub-components used in this compomnents
import DeveloperNavBar from '@/dev/developer_mode/DeveloperNavBar.vue'
import DevConsoleBar from '@/dev/developer_mode/DevConsoleBar.vue'
import DevSideBar from '@/dev/developer_mode/DevSideBar.vue'
import PresentationNavBar from '@/dev/presentation_mode/PresentationNavBar.vue'

// bars that are part of the actual experiments
import StatusBar from '@/builtins/navbars/StatusBar.vue'
import WindowSizerView from '@/builtins/window_sizer/WindowSizerView.vue'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
import KeyCommandNotification from '@/dev/developer_mode/KeyCommandNotification.vue'
const api = useAPI()

const toosmall = ref(api.isBrowserTooSmall())

const height_pct = computed(() => `${api.store.dev.consoleBarHeight}px`)

const showStatusBar = computed(() => {
  return api.currentRouteName() !== 'data' && api.currentRouteName() !== 'recruit' && api.config.mode != 'presentation'
})

// Add notification state
const showNotification = ref(false)
const notificationCommand = ref('')
const notificationAction = ref('')

const showTemporaryNotification = (command, action) => {
  notificationCommand.value = command
  notificationAction.value = action
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 1500) // Hide after 1.5 seconds
}
</script>
<template>
  <div class="app-container">
    <!-- Top toolbar - always visible, 30px tall, full width -->
    <div class="toolbar">
      <DeveloperNavBar v-if="api.config.mode == 'development'"> </DeveloperNavBar>
      <PresentationNavBar v-if="api.config.mode == 'presentation'"> </PresentationNavBar>
    </div>

    <!-- Middle row - content and sidebar -->
    <div class="router" v-if="toosmall">
      <WindowSizerView triggered="true"></WindowSizerView>
    </div>
    <div v-else class="content-wrapper">
      <div class="content-and-console">
        <!-- Main content - scrollable -->
        <div class="main-content">
          <StatusBar v-if="showStatusBar" />
          <router-view />
        </div>

        <!-- Bottom console - can be toggled -->
        <Transition name="console-slide">
          <div v-if="api.config.mode == 'development' && api.store.dev.showConsoleBar" class="console">
            <DevConsoleBar />
          </div>
        </Transition>
      </div>

      <!-- Sidebar - can be toggled, transitions in/out -->
      <Transition name="sidebar-slide">
        <div v-if="api.config.mode == 'development' && api.store.dev.showSideBar" class="sidebar">
          <DevSideBar />
        </div>
      </Transition>
    </div>

    <KeyCommandNotification :show="showNotification" :command="notificationCommand" :action="notificationAction" />
  </div>
</template>

<style scoped>
.router {
  height: 100vh;
  height: v-bind(total_height);
  background-color: var(--page-bg-color);
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.toolbar {
  height: 33px;
  width: calc(100% - 14px); /* Account for typical scrollbar width */
  background-color: var(--dev-bar-light-grey);
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: calc(100% - 14px);
}

.content-and-console {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
}

.sidebar {
  flex: 0 0 280px;
  height: 100%;
  overflow-y: auto;
  border-left: var(--dev-bar-lines);
  background-color: var(--dev-bar-background);
}

.console {
  height: v-bind(height_pct);
  width: 100%;
  background-color: #6798c8;
  overflow: hidden;
  overflow-x: hidden;
}

/* Transition effects */

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.3s ease-in-out;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  flex: 0 0 0px;
  width: 0px;
  overflow: hidden;
}

.console-slide-enter-active,
.console-slide-leave-active {
  transition: height 0.3s ease-in-out;
}

.console-slide-enter-from,
.console-slide-leave-to {
  height: 0;
}
</style>
