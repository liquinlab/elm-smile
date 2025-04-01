<script setup>
import { watch, ref } from 'vue'

import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const props = defineProps(['routeName'])

import useLog from '@/core/stores/log'
const log = useLog()
import { useRoute, useRouter } from 'vue-router'
const hoverRoute = ref('')
const router = useRouter() // this is needed in composition API because this.$router not availabel
const route = useRoute()

// construct routes in order we want to display them
const routerRoutes = router.getRoutes()
// get seqtimeline and routes from local storage
const seqtimeline = api.store.local.seqtimeline
const routes = api.store.local.routes

// filter routes - only those that aren't in seqtimeline
const filteredRoutes = routes.filter((r) => {
  return !seqtimeline.find((s) => s.name === r.name)
})

// now append seqtimeline and filteredRoutes
const allRoutes = seqtimeline.concat(filteredRoutes)

// watch route -- if route changes, update value of current query. This will get carried forward when you jump routes
const currentQuery = ref(route.query)
watch(route, async (newRoute, oldRoute) => {
  currentQuery.value = newRoute.query
})

function setHover(route) {
  hoverRoute.value = route
}

function navigate(route) {
  log.warn(`DEV MODE: user requested to FORCE navigate to ${route}`)
  api.goToView(route, true)
}
</script>
<template>
  <div class="dropdown-content has-text-left">
    <template v-for="r in allRoutes">
      <div
        class="routelabel"
        @mouseover="hoverRoute = r.name"
        @mouseout="hoverRoute = ''"
        :class="{ route_selected: routeName === r.name, hover: hoverRoute === r.name }"
        @click="navigate(r.name)"
      >
        <span class="is-size-7">
          <!-- fa icon arrow down -->

          <div class="routename">
            <span v-if="r.meta.level > 0" v-for="i in r.meta.level" style="margin-left: 5px">&nbsp;</span>
            <FAIcon v-if="r.meta.sequential" icon="fa-solid fa-arrow-down" />
            <FAIcon v-else icon="fa-solid fa-diamond" />
            /{{ r.name }}
          </div>
        </span>
      </div>
    </template>
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
