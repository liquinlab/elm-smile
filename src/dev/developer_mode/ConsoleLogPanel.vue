<script setup>
import { computed } from 'vue'
import SmileAPI from '@/core/composables/useAPI'
const api = SmileAPI()

import useLog from '@/core/stores/log'
const log = useLog()

// Import shadcn/ui components
import { Input } from '@/uikit/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Switch } from '@/uikit/components/ui/switch'
import { Label } from '@/uikit/components/ui/label'

const height_pct = computed(() => `${api.store.dev.consoleBarHeight - 55}px`)

function filter_log(msg) {
  const search_match = msg.message.toLowerCase().includes(api.store.dev.searchParams.toLowerCase())
  let type_match = true
  switch (api.store.dev.logFilter) {
    case 'All':
      break
    case 'Debug only':
      type_match = msg.type === 'debug'
      break
    case 'Warnings and Errors only':
      type_match = msg.type === 'warn' || msg.type === 'error'
      break
    case 'Warnings only':
      type_match = msg.type === 'warn'
      break
    case 'Errors only':
      type_match = msg.type === 'error'
      break
  }
  return search_match && type_match
}

function getBgClass(msg) {
  switch (msg.type) {
    case 'log':
      return 'bg-background'
    case 'warn':
      return 'bg-yellow-100'
    case 'error':
      return 'bg-red-100'
    case 'debug':
      return 'bg-muted text-muted-foreground'
    case 'success':
      return 'bg-green-100'
    default:
      return 'bg-background'
  }
}
</script>
<template>
  <!-- content of panel here -->
  <div class="h-full p-0 m-0">
    <div class="bg-muted border-b border-t border-dev-lines px-3 py-2 font-mono">
      <div class="flex items-center justify-end gap-4 text-xs">
        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Since last view:</Label>
          <Switch v-model="api.store.dev.lastViewLimit" size="sm" />
        </div>

        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Search:</Label>
          <Input v-model="api.store.dev.searchParams" placeholder="Search..." class="h-6 w-24 text-xs" />
        </div>

        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Filter:</Label>
          <Select v-model="api.store.dev.logFilter">
            <SelectTrigger class="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Current page only">Current page only</SelectItem>
              <SelectItem value="Debug only">Debug only</SelectItem>
              <SelectItem value="Warnings and Errors only">Warnings and Errors only</SelectItem>
              <SelectItem value="Warnings only">Warnings only</SelectItem>
              <SelectItem value="Errors only">Errors only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center gap-2">
          <Label class="text-xs font-semibold">Notifications:</Label>
          <Select v-model="api.store.dev.notificationFilter">
            <SelectTrigger class="h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Warnings and Errors">Warnings and Errors</SelectItem>
              <SelectItem value="Warnings only">Warnings only</SelectItem>
              <SelectItem value="Errors only">Errors only</SelectItem>
              <SelectItem value="Success only">Success only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div
      class="w-full max-w-full m-0 overflow-hidden overflow-y-scroll flex flex-col-reverse box-border"
      :style="{ height: height_pct }"
    >
      <div class="w-full max-w-full">
        <ul v-if="api.store.dev.lastViewLimit" class="w-full max-w-full">
          <template v-for="msg in log.page_history">
            <li
              v-if="filter_log(msg)"
              :class="[
                getBgClass(msg),
                'text-xs font-mono p-2 pr-0 border-b border-border whitespace-pre-wrap break-words max-w-full',
              ]"
            >
              <FAIcon icon="fa-solid fa-code-branch" v-if="msg.message.includes('ROUTER GUARD')" />
              <FAIcon icon="fa-solid fa-database" v-else-if="msg.message.includes('SMILESTORE')" />
              <FAIcon icon="fa-solid fa-gear" v-else-if="msg.message.includes('DEV MODE')" />
              <FAIcon icon="fa-solid fa-clock" v-else-if="msg.message.includes('TIMELINE STEPPER')" />
              <FAIcon icon="fa-regular fa-clock" v-else-if="msg.message.includes('TRIAL STEPPER')" />
              <img src="/src/assets/dev/firebase-bw.svg" width="15" v-else-if="msg.message.includes('FIRESTORE')" />
              <FAIcon icon="fa-solid fa-angle-right" v-else />
              &nbsp;{{ msg.time }} <span class="font-semibold">{{ msg.message }}</span> <br />&nbsp;&nbsp;{{
                msg.trace
              }}
            </li>
          </template>
        </ul>
        <ul v-else class="w-full max-w-full">
          <template v-for="msg in log.history">
            <li
              v-if="filter_log(msg)"
              :class="[
                getBgClass(msg),
                'text-xs font-mono p-2 pr-0 border-b border-border whitespace-pre-wrap break-words max-w-full',
              ]"
            >
              <FAIcon icon="fa-solid fa-code-branch" v-if="msg.message.includes('ROUTER GUARD')" />
              <FAIcon icon="fa-solid fa-database" v-else-if="msg.message.includes('SMILESTORE')" />
              <FAIcon icon="fa-solid fa-gear" v-else-if="msg.message.includes('DEV MODE')" />
              <FAIcon icon="fa-solid fa-clock" v-else-if="msg.message.includes('TIMELINE STEPPER')" />
              <FAIcon icon="fa-regular fa-clock" v-else-if="msg.message.includes('TRIAL STEPPER')" />
              <img src="/src/assets/dev/firebase-bw.svg" width="15" v-else-if="msg.message.includes('FIRESTORE')" />
              <FAIcon icon="fa-solid fa-angle-right" v-else />
              &nbsp;{{ msg.time }} <span class="font-semibold">{{ msg.message }}</span> <br />&nbsp;&nbsp;{{
                msg.trace
              }}
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styling for better UX */
.overflow-y-scroll::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-scroll::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 3px;
}

.overflow-y-scroll::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.overflow-y-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Theme-aware background colors for log messages */
.bg-background {
  background-color: var(--background);
}

.bg-muted {
  background-color: var(--muted);
}

.text-muted-foreground {
  color: var(--muted-foreground);
}

.border-border {
  border-color: var(--border);
}

/* Legacy styles for backward compatibility - now using theme variables */
.search {
  max-width: 100px;
}

.togglebar {
  min-height: 35px;
  background-color: var(--muted);
  border-bottom: 0.05em solid var(--border);
  padding-bottom: 3px;
  padding-top: 3px;
  width: 100%;
  text-align: right;
}

.togglebar ul {
  list-style-type: none;
  padding: 0px;
  padding-left: 10px;
}

.togglebar li {
  display: inline;
  padding: 5px;
  font-size: 0.7em;
}

.columnheader {
  background: var(--muted);
  color: var(--muted-foreground);
  padding: 5px;
  font-size: 0.8em;
  margin-bottom: 10px;
  margin-top: 0px;
}

.contentpanel {
  padding-left: 0px;
  margin: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  height: 100%;
}

.scrollablelog {
  height: v-bind(height_pct);
  max-height: 100%;
  width: 100%;
  max-width: 100%;
  margin: 0px;
  margin-top: 0px;
  overflow: hidden;
  overflow-y: scroll;
  display: flex;
  flex-direction: column-reverse;
  box-sizing: border-box;
}

.menu-list {
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.menu-list li {
  font-size: 0.7em;
  font-family: monospace;
  padding: 7px;
  padding-right: 0px;
  border-bottom: 1px solid var(--border);
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  overflow-wrap: break-word;
}

/* Keep semantic colors for log types but make them theme-aware */
.bg-yellow-100 {
  background-color: hsl(48, 96%, 89%);
}

.bg-red-100 {
  background-color: hsl(0, 84%, 90%);
}

.bg-green-100 {
  background-color: hsl(142, 76%, 94%);
}
</style>
