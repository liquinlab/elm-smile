<script setup>
import { ref, computed } from 'vue'
import useAPI from '@/core/composables/useAPI'

import WindowSizerView from '@/builtins/window_sizer/WindowSizerView.vue'
import StatusBar from '@/builtins/navbars/StatusBar.vue'

// Define props
const props = defineProps({
  deviceHeight: {
    type: Number,
    default: 600,
  },
  deviceWidth: {
    type: Number,
    default: 800,
  },
})

const api = useAPI()

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

// Pure computed property without side effects
const deviceTooSmall = computed(() => {
  try {
    const val = api.isBrowserTooSmall(props.deviceWidth, props.deviceHeight)
    api.store.browserEphemeral.tooSmall = val
    return val
  } catch (error) {
    console.warn('Error in deviceTooSmall computed:', error)
    return false
  }
})

// Watcher to update store when toosmall changes
// watch(
//   toosmall,
//   (newValue) => {
//     api.store.browserEphemeral.tooSmall = newValue
//   },
//   { immediate: true }
// )
</script>

<template>
  <div class="@container" ref="containerDiv">
    <StatusBar v-if="showStatusBar" />
    <div class="bg-background" v-if="deviceTooSmall">
      <WindowSizerView triggered="true"></WindowSizerView>
    </div>
    <router-view v-else />
  </div>
</template>
