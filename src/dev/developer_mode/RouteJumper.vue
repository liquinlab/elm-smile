<script setup>
import { watch, ref } from 'vue'

import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const props = defineProps(['routeName'])

import useLog from '@/core/stores/log'
const log = useLog()
import { useRoute, useRouter } from 'vue-router'
import { DropdownMenuContent, DropdownMenuItem } from '@/uikit/components/ui/dropdown-menu'

const hoverRoute = ref('')
const router = useRouter() // this is needed in composition API because this.$router not availabel
const route = useRoute()

// construct routes in order we want to display them
const routerRoutes = router.getRoutes()
// get seqtimeline and routes from local storage
const seqtimeline = api.store.browserPersisted.seqtimeline
const routes = api.store.browserPersisted.routes

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
  <DropdownMenuContent align="end">
    <DropdownMenuItem
      v-for="r in allRoutes"
      :key="r.name"
      @mouseover="hoverRoute = r.name"
      @mouseout="hoverRoute = ''"
      :class="{
        'bg-accent text-accent-foreground': route.name === r.name,
        'bg-muted': hoverRoute === r.name,
      }"
      @click="navigate(r.name)"
      class="cursor-pointer"
    >
      <span class="text-[0.65rem] font-mono">
        <div class="routename font-medium">
          <span v-if="r.meta.level > 0" v-for="i in r.meta.level" style="margin-left: 5px">&nbsp;</span>
          <i-lucide-arrow-down v-if="r.meta.sequential" class="inline mr-1" />
          <i-lucide-presentation v-else-if="r.name === 'presentation_home'" class="inline mr-1" />
          <i-lucide-diamond v-else class="inline mr-1" />
          /{{ r.name }}
        </div>
      </span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</template>
