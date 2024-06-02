<script setup>
//import RouteGraph from '@/components/navbars/RouteGraph.vue'
import { watch, ref } from 'vue'

import { useKeyModifier } from '@vueuse/core'
const altKeyState = useKeyModifier('Alt')

import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()
const props = defineProps(['routeName'])

import useSmileStore from '@/core/stores/smiledata'
import { routes } from '@/core/router'
import { useRouter, useRoute } from 'vue-router'
const smilestore = useSmileStore() // load the global store

import useLog from '@/core/stores/log'
const log = useLog()

const hoverRoute = ref('')
const router = useRouter() // this is needed in composition API because this.$router not availabel
const route = useRoute()

// watch route -- if route changes, update value of current query. This will get carried forward when you jump routes
const currentQuery = ref(route.query)
watch(route, async (newRoute, oldRoute) => {
  currentQuery.value = newRoute.query
})

function setHover(route) {
  hoverRoute.value = route
}

watch(altKeyState, (value) => {
  api.dev.allowJumps = !value
})

function navigate(route) {
  if (api.dev.allowJumps) {
    log.warn(`DEV MODE: user requested to FORCE navigate to ${route}`)
  } else {
    log.warn(`DEV MODE: user requested to navigate to ${route}`)
  }
  router.push({ name: route })
  // dismiss hover if open but not if panel is set to remain visible.
  //api.dev.route_panel.visible = false
}
</script>
<template>
  <div class="dropdown-content has-text-left">
    <template v-for="r in router.getRoutes()">
      <div
        class="routelabel"
        @mouseover="hoverRoute = r.name"
        @mouseout="hoverRoute = ''"
        :class="{ route_selected: routeName === r.name, hover: hoverRoute === r.name }"
        @click="navigate(r.name)"
      >
        <span class="is-size-7">
          <div class="routename">/{{ r.name }}</div>
          <div class="forcebutton forcemode" v-if="altKeyState && hoverRoute === r.name">
            <FAIcon icon="fa-solid fa-square-caret-right" />
          </div>
        </span>
      </div>
    </template>
    <hr />
    <div class="note">Use ⌥ + click to navigate as the user in real experiment would.</div>
  </div>
</template>

<style scoped>
.dropdown-content {
  padding-left: 10px;
  padding-right: 5px;
}
.dropdown-content hr {
  margin: 0;
  border-top: 0.05em solid #cbcbcb;
}

.forcemode {
  color: #595959;
}
.note {
  font-size: 0.8em;
  color: #6b6b6b;
  padding-top: 3px;
}

.dropdown-content b {
  color: #000;
  font-size: 13px;
}
.hover {
  background-color: #f0f0f0;
}
.routelink {
  font-family: monospace;
}

.routename {
  font-weight: 800;
}

.forcebutton {
  font-size: 0.8rem;
  position: absolute;

  position: absolute;
  right: 2px;
  top: 3px;
  padding: 3px;
  margin-right: 4px;
  margin-left: auto;
}
.route_selected {
  background-color: #bbbbbb;
  color: #fff;
  font-weight: 500;
}

.routelabel {
  font-weight: 800;
  font-family: 'Courier New', Courier, monospace;
  display: inline-block;
  position: relative;
  width: 100%;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 5px;
}
</style>
