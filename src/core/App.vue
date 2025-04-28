<script setup>
/**
 * @fileoverview Main App component setup script that initializes core dependencies and state
 */

import { onMounted, ref } from 'vue'

/**
 * Import notification system components and styles
 * @requires notivue Notification library
 */
import { Notivue, Notification, NotificationProgress } from 'notivue'
import 'notivue/notification.css' // Only needed if using built-in notifications
import 'notivue/animations.css' // Only needed if using built-in animations
import 'notivue/notification-progress.css'
import { pastelTheme } from 'notivue'

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
 * @mutates smilestore.global.dbChanges - Sets flag when changes detected
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
      smilestore.global.dbChanges = true
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
  <Notivue v-slot="item">
    <Notification :item="item" :theme="pastelTheme">
      <NotificationProgress :item="item" />
    </Notification>
  </Notivue>
  <SmileApp />
</template>
