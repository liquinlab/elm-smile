<script setup>
import { onMounted, computed, ref } from 'vue'

// load sub-components used in this compomnents
import DeveloperNavBar from '@/components/navbars/DeveloperNavBar.vue'
import DevDataBar from '@/components/navbars/DevDataBar.vue'
import PresentationNavBar from '@/components/navbars/PresentationNavBar.vue'

// bars that are part of the actual experiments
import StatusBar from '@/components/navbars/StatusBar.vue'
import ProgressBar from '@/components/navbars/ProgressBar.vue'

// notification library
import { Notivue, Notification, NotificationProgress } from 'notivue'
import 'notivue/notification.css' // Only needed if using built-in notifications
import 'notivue/animations.css' // Only needed if using built-in animations
import 'notivue/notification-progress.css'
import { pastelTheme } from 'notivue'

import WindowSizerPage from '@/components/screen_adjust/WindowSizerPage.vue'

// import and initalize smile API
import useSmileAPI from '@/core/composables/smileapi'
const api = useSmileAPI()

// use the log feature
import useLog from '@/core/stores/log'
const log = useLog()

// get the smilestore
import useSmileStore from '@/core/stores/smiledata'
const smilestore = useSmileStore() // load the global store

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

      log.log(`smilestore.data value changed for ${key}: from ${oldv} to ${newv}`)
      smilestore.global.db_changes = true
    }
  })
  snapshot = { ...newstate.data }
})

const total_height = computed(() => {
  if (api.config.mode == 'development' && !api.dev.show_data_bar) {
    return '100vh'
  } else {
    var pct = ((window.innerHeight + api.dev.data_bar_height) / window.innerHeight) * 100
    return `${pct}vh`
  }
})

const toosmall = ref(api.isBrowserTooSmall())

onMounted(() => {
  log.log('App.vue initialized')

  window.addEventListener('resize', (event) => {
    api.recordWindowEvent('resize', { width: window.innerWidth, height: window.innerHeight })
    toosmall.value = api.isBrowserTooSmall()
  })

  window.addEventListener('focus', (event) => {
    api.recordWindowEvent('focus')
  })

  window.addEventListener('blur', (event) => {
    api.recordWindowEvent('blur')
  })
})

</script>

<template>
  <DeveloperNavBar v-if="api.config.mode == 'development'"> </DeveloperNavBar>
  <PresentationNavBar v-if="api.config.mode == 'presentation'"> </PresentationNavBar>
  <Notivue v-slot="item">
    <Notification :item="item" :theme="pastelTheme">
      <NotificationProgress :item="item" />
    </Notification>
  </Notivue>
  <StatusBar
    v-if="
      api.currentRouteName() !== 'data' && api.currentRouteName() !== 'recruit' && api.config.mode != 'presentation'
    "
  ></StatusBar>
  <!-- the router loads here -->
  <div class="router" v-if="!toosmall">
    <router-view></router-view>
  </div>
  <div v-else>
    <WindowSizerPage triggered="true"></WindowSizerPage>
  </div>
  <ProgressBar
    v-if="
      api.currentRouteName() !== 'config' &&
      api.currentRouteName() !== 'recruit' &&
      api.config.show_progress_bar == 'true'
    "
  >
  </ProgressBar>
  <Transition name="v-slide">
    <DevDataBar v-if="api.config.mode == 'development' && api.dev.show_data_bar"></DevDataBar>
  </Transition>
</template>

<style>
.router {
  height: '100vh';
  height: v-bind(total_height); /* // SMILE_DEV_ONLY */
  background-color: var(--page-bg-color);
}

#app {
  font-family: var(--vp-font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.v-slide-enter-active,
.v-slide-leave-active {
  transition: all 0.3s ease-in-out;
}
.v-slide-enter-from,
.v-slide-leave-to {
  overflow: hidden;
  max-height: 0;
  height: 0;
}
.v-slide-enter-to,
.v-slide-leave-from {
  overflow: hidden;
  max-height: 100%;
  height: auto;
}
</style>
