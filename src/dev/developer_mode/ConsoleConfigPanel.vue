<script setup>
import { reactive, computed, onMounted } from 'vue'
import ConfigList from '@/dev/developer_mode/ConfigList.vue'
import SmileAPI from '@/core/composables/useAPI'
const api = SmileAPI()

// shadcn/ui components
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/uikit/components/ui/breadcrumb'
import { Button } from '@/uikit/components/ui/button'

const browse_panels = reactive({ path: ['/', null, null] })

onMounted(() => {
  if (api.store.dev.configPath !== null) {
    browse_panels.path = JSON.parse(api.store.dev.configPath) // hydrate from api.store
  }
})

function save_path() {
  api.store.dev.configPath = JSON.stringify(browse_panels.path)
}

const n_active_panels = computed(() => {
  var count = 0
  for (var i = 0; i < browse_panels.path.length; i++) {
    if (browse_panels.path[i] !== null) {
      count++
    }
  }
  return count
})

function panel_path(cutoff) {
  var path = ''
  if (browse_panels.path[browse_panels.path.length - cutoff - 1] == null) {
    return null
  } else {
    for (var i = 0; i < browse_panels.path.length - cutoff; i++) {
      path += String(browse_panels.path[i])
      if (i < browse_panels.path.length - cutoff - 1) {
        path += '.'
      }
    }
    return path
  }
}

function panel1_select(option) {
  browse_panels.path.pop()
  browse_panels.path.pop()
  browse_panels.path.push(String(option))
  if (browse_panels.path.length < 3) {
    browse_panels.path.push(null)
  }
  save_path()
}

function panel2_select(option) {
  browse_panels.path.pop()
  browse_panels.path.push(String(option))
  save_path()
}

function panel3_select(option) {
  browse_panels.path.push(String(option))
  save_path()
}
function panel_jump(index) {
  // for everything after index set to null
  for (var i = index + 1; i < browse_panels.path.length; i++) {
    browse_panels.path[i] = null
  }
  // trim browse_panels to length three
  browse_panels.path = browse_panels.path.slice(0, 3)
}

function resetDevState() {
  localStorage.removeItem(api.config.devLocalStorageKey) // delete the local store
  location.reload()
}
</script>
<template>
  <div class="h-full m-0 p-0">
    <Breadcrumb class="bg-muted border-b border-t border-dev-lines px-3 py-2 font-mono">
      <BreadcrumbList>
        <template v-for="(option, index) in browse_panels.path">
          <template v-if="option !== null">
            <BreadcrumbItem :key="index">
              <BreadcrumbLink as="button" @click="panel_jump(index)" class="flex items-center text-xs">
                <template v-if="option == '/'">
                  <FAIcon icon="fa-solid fa-home" />
                </template>
                <template v-else>{{ option }}</template>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="index < n_active_panels - 1" />
          </template>
        </template>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-row h-[calc(100%-30px)]">
      <div class="flex flex-col w-1/6 min-w-[120px] border-r border-l border-dev-lines bg-muted p-2 gap-2">
        <div class="text-xs text-left mb-2 font-mono">
          Read more about configuration options
          <a href="https://smile.gureckislab.org/configuration.html" class="text-blue-600 underline ml-1">in the docs</a
          >.
        </div>
      </div>
      <div class="flex-1 grid grid-cols-3 gap-0 bg-gray-50 overflow-hidden">
        <div class="border-r border-gray-200 bg-gray-50 h-full overflow-hidden">
          <ConfigList
            :data="panel_path(2)"
            :selected="browse_panels.path[browse_panels.path.length - 2]"
            @selected="panel1_select"
          />
        </div>
        <div class="border-r border-gray-200 bg-gray-50 h-full overflow-hidden">
          <ConfigList
            :data="panel_path(1)"
            :selected="browse_panels.path[browse_panels.path.length - 1]"
            @selected="panel2_select"
          />
        </div>
        <div class="bg-gray-50 h-full overflow-hidden">
          <ConfigList :data="panel_path(0)" @selected="panel3_select" />
        </div>
      </div>
    </div>
  </div>
</template>
