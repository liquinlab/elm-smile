<script setup>
import { onMounted, computed, ref } from 'vue'

import SmileApp from '@/core/SmileApp.vue' // import the main smile component

// notification library
import { Notivue, Notification, NotificationProgress } from 'notivue'
import 'notivue/notification.css' // Only needed if using built-in notifications
import 'notivue/animations.css' // Only needed if using built-in animations
import 'notivue/notification-progress.css'
import { pastelTheme } from 'notivue'

// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// get the smilestore
import useSmileStore from '@/core/stores/smilestore'
const smilestore = useSmileStore() // load the global store

const toosmall = ref(api.isBrowserTooSmall())

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
