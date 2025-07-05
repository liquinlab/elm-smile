<script setup>
/**
 * @fileoverview Main App component setup script that initializes core dependencies and state
 */

import { onMounted, ref } from 'vue'

import { Toaster } from '@/uikit/components/ui/sonner'
import 'vue-sonner/style.css' // vue-sonner v2 requires this import

import { useColorMode } from '@vueuse/core'
useColorMode()

import DevAppSidebar from '@/dev/DevAppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/uikit/components/ui/sidebar'
/**
 * Import main application component
 * @requires SmileApp Main SMILE application component
 */
import SmileApp from '@/core/SmileApp.vue'

/**
 * Initialize SMILE API instance
 * @requires useAPI API composable
 * @constant {Object} api - Global API instance
 */
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

/**
 * Initialize global store
 * @requires useSmileStore Store composable
 * @constant {Object} smilestore - Global state store instance
 */
import useSmileStore from '@/core/stores/smilestore'
const smilestore = useSmileStore()

/**
 * Reactive reference tracking if browser window is too small
 * @type {import('vue').Ref<boolean>}
 */
const toosmall = ref(api.isBrowserTooSmall())

/**
 * Creates a snapshot of the current smilestore data state and subscribes to changes
 *
 * Tracks changes to smilestore.data by:
 * 1. Taking an initial snapshot of the data state
 * 2. Subscribing to store mutations
 * 3. Comparing new state with snapshot for changes
 * 4. Logging any detected changes
 * 5. Updating the snapshot
 *
 * @type {Object} snapshot - Copy of current smilestore data state
 * @listens smilestore.$subscribe - Subscribes to store mutations
 * @fires api.log.log - Logs detected changes to store data
 * @mutates smilestore.browserEphemeral.dbChanges - Sets flag when changes detected
 */
var snapshot = { ...smilestore.$state.data }
smilestore.$subscribe((mutation, newstate) => {
  Object.keys(newstate.data).forEach((key) => {
    if (snapshot[key] !== newstate.data[key]) {
      // test if newstate.data[key] is an Object
      let oldv = snapshot[key]
      let newv = newstate.data[key]
      if (typeof newstate.data[key] === 'object') {
        oldv = JSON.stringify(snapshot[key])
        newv = JSON.stringify(newstate.data[key])
      }

      api.log.log(`SMILESTORE: smilestore.data value changed for ${key}: from ${oldv} to ${newv}`)
      smilestore.browserEphemeral.dbChanges = true
    }
  })
  snapshot = { ...newstate.data }
})

/**
 * Sets up window event listeners when component is mounted
 *
 * Adds event listeners for:
 * - resize: Records window dimensions and updates toosmall flag
 * - focus: Records when window gains focus
 * - blur: Records when window loses focus
 *
 * All events are logged via api.recordWindowEvent()
 * Resize events also update the toosmall reactive ref
 * All listeners use passive mode for better performance
 */
onMounted(() => {
  api.log.log('App.vue initialized')

  window.addEventListener(
    'resize',
    (event) => {
      api.recordWindowEvent('resize', { width: window.innerWidth, height: window.innerHeight })
      toosmall.value = api.isBrowserTooSmall()
    },
    { passive: true }
  )

  window.addEventListener(
    'focus',
    (event) => {
      api.recordWindowEvent('focus')
    },
    { passive: true }
  )

  window.addEventListener(
    'blur',
    (event) => {
      api.recordWindowEvent('blur')
    },
    { passive: true }
  )
})
</script>

<template>
  <Toaster closeButton position="top-left" :rich-colors="true" class="custom-toaster" />
  <SidebarProvider
    :default-open="false"
    :style="{
      '--sidebar-width': '48px',
    }"
  >
    <DevAppSidebar />
    <SidebarInset>
      <SmileApp />
    </SidebarInset>
  </SidebarProvider>
</template>

<style>
.custom-toaster {
  --toast-offset-x: 60px;
  --toast-offset-y: 50px;
}

.custom-toaster {
  top: var(--toast-offset-y) !important;
  left: var(--toast-offset-x) !important;
}
</style>
