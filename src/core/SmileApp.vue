<script setup>
import { ref, computed } from 'vue'
import { onKeyDown } from '@vueuse/core'

// load sub-components used in this compomnents
import DeveloperNavBar from '@/dev/developer_mode/DeveloperNavBar.vue'
import DevDataBar from '@/dev/developer_mode/DevDataBar.vue'
import DevSideBar from '@/dev/developer_mode/DevSideBar.vue'
import PresentationNavBar from '@/dev/presentation_mode/PresentationNavBar.vue'

// bars that are part of the actual experiments
import StatusBar from '@/builtins/navbars/StatusBar.vue'
import WindowSizerView from '@/builtins/window_sizer/WindowSizerView.vue'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const toosmall = ref(api.isBrowserTooSmall())

const height_pct = computed(() => `${api.store.dev.console_bar_height}px`)

const showStatusBar = computed(() => {
  return api.currentRouteName() !== 'data' && api.currentRouteName() !== 'recruit' && api.config.mode != 'presentation'
})

// Add keyboard shortcuts for dev mode
onKeyDown(['Alt', '1'], (e) => {
  if (api.config.mode === 'development') {
    e.preventDefault()
    api.store.dev.show_side_bar = !api.store.dev.show_side_bar
  }
})

onKeyDown(['Alt', '2'], (e) => {
  if (api.config.mode === 'development') {
    e.preventDefault()
    api.store.dev.show_console_bar = !api.store.dev.show_console_bar
  }
})

onKeyDown(['Alt', '3'], (e) => {
  if (api.config.mode === 'development') {
    e.preventDefault()
    // If both are visible or only one is visible, hide both
    if (api.store.dev.show_side_bar || api.store.dev.show_console_bar) {
      api.store.dev.show_side_bar = false
      api.store.dev.show_console_bar = false
    } else {
      // If neither is visible, show both
      api.store.dev.show_side_bar = true
      api.store.dev.show_console_bar = true
    }
  }
})
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
    <div v-else class="content-area">
      <!-- Main content - scrollable, expands when sidebar is hidden -->
      <div class="main-content">
        <StatusBar v-if="showStatusBar" />
        <router-view />
      </div>

      <!-- Sidebar - can be toggled, transitions in/out -->
      <Transition name="sidebar-slide">
        <div v-if="api.config.mode == 'development' && api.store.dev.show_side_bar" class="sidebar">
          <DevSideBar />
        </div>
      </Transition>
    </div>

    <!-- Bottom console - can be toggled, 200px tall when visible -->
    <Transition name="console-slide">
      <div v-if="api.config.mode == 'development' && api.store.dev.show_console_bar" class="console">
        <DevDataBar />
      </div>
    </Transition>
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

.content-area {
  display: flex;
  overflow: hidden;
  position: relative;
  min-height: 0;
  width: calc(100% - 14px); /* Changed from 100vw to account for scrollbar */
  height: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
}

.sidebar {
  flex-direction: column;
  flex: 0 0 280px;
  height: 100%; /* Subtract toolbar height (33px) and console height if visible */
  overflow: hidden; /* Changed from auto to hidden to prevent scrolling */
  border-left: var(--dev-bar-lines);
  background-color: var(--dev-bar-background);
}

.console {
  height: v-bind(height_pct);
  width: calc(100% - 14px); /* Account for typical scrollbar width */
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
