<script setup>
/**
 * @fileoverview Main SmileApp component that handles the core application layout and mode-specific components
 */

import { ref, computed } from 'vue'

/**
 * Developer mode components for debugging and development tools
 * @requires DeveloperNavBar Navigation bar for developer mode
 * @requires DevConsoleBar Console bar for developer tools
 * @requires DevConsoleBarTailwind Console bar for developer tools
 * @requires DevSideBar Side bar for developer tools
 */
import DeveloperNavBar from '@/dev/developer_mode/DeveloperNavBar.vue'
//import DevConsoleBar from '@/dev/developer_mode/DevConsoleBar.vue'
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

import ResponsiveDeviceContainer from '@/dev/developer_mode/ResponsiveDeviceContainer.vue'

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

/**
 * Computed property that determines whether to wrap content in ResponsiveDeviceContainer
 *
 * @returns {boolean} True if ResponsiveDeviceContainer should be used, false otherwise
 * - Returns false if current route is '/' (root route)
 * - Returns true otherwise
 */
const shouldUseResponsiveContainer = computed(() => {
  const routeName = api.currentRouteName()
  return routeName !== undefined && routeName !== 'recruit' && api.config.mode == 'development'
})

/**
 * Computed property that determines if the app is still loading
 *
 * @returns {boolean} True if the route name is not yet available, false otherwise
 */
const isLoading = computed(() => {
  return api.currentRouteName() === undefined
})
</script>
<template>
  <div class="app-container">
    <!-- Analyze Mode - Clean full-screen dashboard -->
    <div v-if="api.store.dev.mainView === 'dashboard'" class="analyze-container">
      <iframe
        :src="api.getPublicUrl('dashboard.html')"
        class="dashboard-iframe"
        frameborder="0"
        title="Dashboard"
      ></iframe>
    </div>

    <!-- Recruit Mode - Clean full-screen recruit page -->
    <div v-else-if="api.store.dev.mainView === 'recruit'" class="recruit-container">
      <iframe :src="api.getPublicUrl('recruit.html')" class="recruit-iframe" frameborder="0" title="Recruit"></iframe>
    </div>

    <!-- Docs Mode - Clean full-screen documentation -->
    <div v-else-if="api.store.dev.mainView === 'docs'" class="docs-container">
      <iframe src="https://smile.gureckislab.org" class="docs-iframe" frameborder="0" title="Documentation"></iframe>
    </div>

    <!-- Developer Mode - Full interface with toolbar, sidebar, console -->
    <template v-else>
      <!-- Top toolbar -->
      <div class="toolbar">
        <DeveloperNavBar />
      </div>

      <!-- Middle row - content and sidebar -->
      <div class="router" v-if="toosmall">
        <WindowSizerView triggered="true"></WindowSizerView>
      </div>
      <div v-else class="content-wrapper">
        <div class="content-and-console">
          <!-- Main content - scrollable -->
          <div class="main-content">
            <div v-if="isLoading" class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading...</p>
            </div>
            <template v-else>
              <ResponsiveDeviceContainer v-if="shouldUseResponsiveContainer">
                <StatusBar v-if="showStatusBar" />
                <router-view />
              </ResponsiveDeviceContainer>
              <template v-else>
                <StatusBar v-if="showStatusBar" />
                <router-view />
              </template>
            </template>
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
    </template>
  </div>
</template>

<style scoped>
.router {
  height: 100vh;
  height: v-bind(total_height);
  background-color: var(--background);
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.analyze-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.recruit-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.docs-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.toolbar {
  margin-top: auto;
  margin-bottom: auto;
  height: 36px;
  width: full; /* Account for typical scrollbar width */
  background-color: var(--dev-bar-bg);
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
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
  flex: 0 0 300px;
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid var(--border);
  background-color: var(--dev-bg);
}

.console {
  height: v-bind(height_pct);
  width: 100%;
  background-color: #adadad;
  overflow: hidden;
  overflow-x: hidden;
}

.analyze-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.dashboard-iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}

.recruit-iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}

.docs-iframe {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
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

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
