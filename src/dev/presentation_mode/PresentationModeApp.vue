<script setup>
/**
 * @fileoverview Main SmileApp component that handles the core application layout and mode-specific components
 */

import { computed } from 'vue'

import PresentationNavBar from '@/dev/presentation_mode/PresentationNavBar.vue'
import MainApp from '@/core/MainApp.vue'

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
 * Computed property for console bar height in pixels
 * @type {import('vue').ComputedRef<string>}
 */
const height_pct = computed(() => `${api.store.dev.consoleBarHeight}px`)

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
  <!-- Main app container for developer mode -->
  <div class="app-container">
    <!-- Developer Mode - Full interface with toolbar, sidebar, console -->
    <!-- Top toolbar -->
    <div class="toolbar">
      <PresentationNavBar />
    </div>

    <!-- Middle row - content and sidebar -->
    <div class="content-wrapper">
      <div class="content-and-console">
        <!-- Main content - scrollable -->
        <div class="main-content bg-background text-foreground">
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
          </div>
          <template v-else>
            <MainApp />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.presentation-content-wrapper {
  display: flex;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

.content-and-console {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
  min-width: 0;
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
  min-width: 0;
  max-width: 100%;
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
