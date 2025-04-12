<script setup>
import { computed } from 'vue'
import SmileAPI from '@/core/composables/useAPI'
const api = SmileAPI()

import useLog from '@/core/stores/log'
const log = useLog()

const height_pct = computed(() => `${api.store.dev.consoleBarHeight - 67}px`)

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
      return 'bg-white'
    case 'warn':
      return 'bg-yellow'
    case 'error':
      return 'bg-red'
    case 'debug':
      return 'bg-grey'
    case 'success':
      return 'bg-green'
    default:
      return ''
  }
}
</script>
<template>
  <!-- content of panel here -->
  <div class="contentpanel">
    <div class="togglebar">
      <ul>
        <li>
          <label class="checkbox">
            <b>Since last page change:</b>&nbsp;
            <input type="checkbox" v-model="api.store.dev.lastPageLimit" />
          </label>
        </li>
        <li>
          <b>Search:</b>&nbsp;
          <input
            class="input is-small search"
            placeholder="Search..."
            type="text"
            v-model="api.store.dev.searchParams"
          />
        </li>
        <li>
          <b>Filter:</b>&nbsp;
          <div class="select is-small">
            <select v-model="api.store.dev.logFilter">
              <option>All</option>
              <option>Current page only</option>
              <option>Debug only</option>
              <option>Warnings and Errors only</option>
              <option>Warnings only</option>
              <option>Errors only</option>
            </select>
          </div>
        </li>
        <li>
          <b>Notifications:</b>&nbsp;
          <div class="select is-small">
            <select v-model="api.store.dev.notificationFilter">
              <option>All</option>
              <option>None</option>
              <option>Warnings and Errors</option>
              <option>Warnings only</option>
              <option>Errors only</option>
              <option>Success only</option>
            </select>
          </div>
        </li>
      </ul>
    </div>

    <div class="scrollablelog">
      <aside class="menu">
        <ul class="menu-list" v-if="api.store.dev.lastPageLimit">
          <template v-for="msg in log.page_history">
            <li :class="getBgClass(msg)" v-if="filter_log(msg)">
              <FAIcon icon="fa-solid fa-code-branch" v-if="msg.message.includes('ROUTER GUARD')" />
              <FAIcon icon="fa-solid fa-database" v-else-if="msg.message.includes('SMILESTORE')" />
              <FAIcon icon="fa-solid fa-gear" v-else-if="msg.message.includes('DEV MODE')" />
              <FAIcon icon="fa-solid fa-clock" v-else-if="msg.message.includes('TIMELINE STEPPER')" />
              <FAIcon icon="fa-regular fa-clock" v-else-if="msg.message.includes('TRIAL STEPPER')" />
              <img src="/src/assets/dev/firebase-bw.svg" width="15" v-else-if="msg.message.includes('FIRESTORE')" />
              <FAIcon icon="fa-solid fa-angle-right" v-else />
              &nbsp;{{ msg.time }} <b>{{ msg.message }}</b> <br />&nbsp;&nbsp;{{ msg.trace }}
            </li>
          </template>
        </ul>
        <ul class="menu-list" v-else>
          <template v-for="msg in log.history">
            <li :class="getBgClass(msg)" v-if="filter_log(msg)">
              <FAIcon icon="fa-solid fa-code-branch" v-if="msg.message.includes('ROUTER GUARD')" />
              <FAIcon icon="fa-solid fa-database" v-else-if="msg.message.includes('SMILESTORE')" />
              <FAIcon icon="fa-solid fa-gear" v-else-if="msg.message.includes('DEV MODE')" />
              <FAIcon icon="fa-solid fa-clock" v-else-if="msg.message.includes('TIMELINE STEPPER')" />
              <FAIcon icon="fa-regular fa-clock" v-else-if="msg.message.includes('TRIAL STEPPER')" />
              <img src="/src/assets/dev/firebase-bw.svg" width="15" v-else-if="msg.message.includes('FIRESTORE')" />
              <FAIcon icon="fa-solid fa-angle-right" v-else />
              &nbsp;{{ msg.time }} <b>{{ msg.message }}</b> <br />&nbsp;&nbsp;{{ msg.trace }}
            </li>
          </template>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.search {
  max-width: 100px;
}
.togglebar {
  min-height: 35px;
  background-color: #eeeeee;
  border-bottom: 0.05em solid #cbcbcb;
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
/*
.togglebar select {
}
*/

.columnheader {
  background: #f4f4f4;
  color: #858484;
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
  border-bottom: 1px solid #f2f2f2;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  overflow-wrap: break-word;
}
.bg-white {
  background-color: #ffffff;
}
.bg-yellow {
  background-color: #e0deaa;
}
.bg-red {
  background-color: #e0aaaa;
}
.bg-grey {
  background-color: #d0dadd;
  color: #505050;
}
.bg-green {
  background-color: rgb(189, 241, 189);
}
</style>
