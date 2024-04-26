<script setup>
import { computed } from 'vue'
import SmileAPI from '@/core/composables/smileapi'
const api = SmileAPI()

import useLog from '@/core/stores/log'
const log = useLog()

const height_pct = computed(() => `${api.dev.data_bar_height - 70}px`)

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
          <b>Search:</b>&nbsp;
          <input class="input is-small search" placeholder="Search..." type="text" v-model="api.dev.search_params" />
        </li>
        <li>
          <b>Filter:</b>&nbsp;
          <div class="select is-small">
            <select>
              <option>All</option>
              <option>Warnings and Errors</option>
              <option>Errors</option>
              <option>Debug only</option>
              <option>Warnings only</option>
              <option>Errors only</option>
            </select>
          </div>
        </li>
        <li>
          <b>Notifications:</b>&nbsp;
          <div class="select is-small">
            <select>
              <option>All</option>
              <option>Warnings and Errors</option>
              <option>Errors</option>
              <option>Debug only</option>
              <option>Errors only</option>
            </select>
          </div>
        </li>
      </ul>
    </div>

    <div class="scrollablelog">
      <aside class="menu">
        <ul class="menu-list">
          <template v-for="msg in log.history">
            <li :class="getBgClass(msg)" v-if="msg.message.toLowerCase().includes(api.dev.search_params.toLowerCase())">
              <FAIcon icon="fa-solid fa-code-branch" v-if="msg.message.includes('ROUTER GUARD')" />
              <FAIcon icon="fa-solid fa-database" v-else-if="msg.message.includes('SMILESTORE')" />
              <FAIcon icon="fa-solid fa-gear" v-else-if="msg.message.includes('DEV MODE')" />
              <FAIcon icon="fa-solid fa-clock" v-else-if="msg.message.includes('TIMELINE STEPPER')" />
              <FAIcon icon="fa-regular fa-clock" v-else-if="msg.message.includes('TRIAL STEPPER')" />
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
.togglebar select {
}

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
  width: 100%;
  margin: 0px;
  margin-top: 0px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column-reverse;
}
.menu-list li {
  font-size: 0.7em;
  font-family: monospace;
  padding: 7px;
  padding-right: 0px;
  border-bottom: 1px solid #f2f2f2;
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
