<script setup>
/**
 * @fileoverview Main SmileApp component that handles the core application layout and mode-specific components
 */

import { ref, computed } from 'vue'

/**
 * Developer mode components for debugging and development tools
 * @requires DeveloperNavBar Navigation bar for developer mode
 * @requires DevConsoleBar Console bar for developer tools
 * @requires DevSideBar Side bar for developer tools
 */
import DeveloperNavBar from '@/dev/developer_mode/DeveloperNavBar.vue'
import DevConsoleBar from '@/dev/developer_mode/DevConsoleBar.vue'
import DevSideBar from '@/dev/developer_mode/DevSideBar.vue'

/**
 * Presentation mode components
 * @requires PresentationNavBar Navigation bar for presentation mode
 */
import PresentationNavBar from '@/dev/presentation_mode/PresentationNavBar.vue'

/**
 * Built-in experiment components
 * @requires StatusBar Status bar component
 * @requires WindowSizerView Window size warning component
 */
import StatusBar from '@/builtins/navbars/StatusBar.vue'
import WindowSizerView from '@/builtins/window_sizer/WindowSizerView.vue'

/**
 * Import API and notification components
 * @requires useAPI SMILE API composable
 */
import useAPI from '@/core/composables/useAPI'

/**
 * Initialize SMILE API instance
 * @constant {Object} api Global API instance
 */
const api = useAPI()

/**
 * Reactive reference tracking if browser window is too small
 * @type {import('vue').Ref<boolean>}
 */
const toosmall = ref(api.isBrowserTooSmall())

/**
 * Computed property for console bar height in pixels
 * @type {import('vue').ComputedRef<string>}
 */
const height_pct = computed(() => `${api.store.dev.consoleBarHeight}px`)

/**
 * Computed property that determines whether to show the status bar
 *
 * @returns {boolean} True if status bar should be shown, false otherwise
 * - Returns false if current route is 'data' or 'recruit'
 * - Returns false if app is in presentation mode
 * - Returns true otherwise
 */
const showStatusBar = computed(() => {
  return api.currentRouteName() !== 'data' && api.currentRouteName() !== 'recruit' && api.config.mode != 'presentation'
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
