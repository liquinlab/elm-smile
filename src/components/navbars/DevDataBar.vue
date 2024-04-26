<script setup>
import { useMouse } from '@vueuse/core'
import { ref, computed } from 'vue'
import DatabaseInfoPanel from '@/components/navbars/DatabaseInfoPanel.vue'
import DatabaseLogPanel from '@/components/navbars/DatabaseLogPanel.vue'
import DatabaseBrowsePanel from '@/components/navbars/DatabaseBrowsePanel.vue'

import useSmileAPI from '@/core/composables/smileapi'
const api = useSmileAPI()
const mousedown = ref(false)

const { x, y } = useMouse()

const height_pct = computed(() => `${api.dev.data_bar_height}px`)

function down() {
  mousedown.value = true
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
}
function up() {
  mousedown.value = false
}
function move() {
  if (mousedown.value == true) {
    api.dev.data_bar_height = Math.min(window.innerHeight - y.value + 20, window.innerHeight) // small adjustment to where you probably click
  }
}
</script>

<template>
  <nav class="databar devdatabar is-fixed-bottom">
    <aside class="menu datamenu">
      <ul class="menu-list">
        <li :class="{ active: api.dev.data_bar_tab == 'database' }">
          <a
            @click="api.dev.data_bar_tab = 'database'"
            class="has-tooltip-arrow has-tooltip-right"
            data-tooltip="Database Info"
            ><FAIcon icon="fa-solid fa-database icon" />
          </a>
        </li>
        <li :class="{ active: api.dev.data_bar_tab == 'browse' }">
          <a
            @click="api.dev.data_bar_tab = 'browse'"
            class="has-tooltip-arrow has-tooltip-right"
            data-tooltip="Data Explorer"
          >
            <FAIcon icon="fa-solid fa-magnifying-glass icon" />
          </a>
        </li>
        <li :class="{ active: api.dev.data_bar_tab == 'log' }">
          <a
            @click="api.dev.data_bar_tab = 'log'"
            class="has-tooltip-arrow has-tooltip-right"
            data-tooltip="Narrative Log"
          >
            <FAIcon icon="fa-solid fa-book icon" />
          </a>
        </li>
      </ul>
    </aside>

    <section class="section secpanel">
      <nav class="databar-panel-header logpanel" role="navigation" aria-label="data navigation">
        <div id="navbardatabase" class="databar-panel-header-menu" @mousedown="down()">
          <div class="databar-panel-header-start">
            <div class="databar-panel-header-item info" v-if="api.dev.data_bar_tab == 'database'">
              <FAIcon icon="fa-solid fa-database icon" />&nbsp;&nbsp;<b>Database Info</b>
            </div>

            <div class="databar-panel-header-item info" v-if="api.dev.data_bar_tab == 'browse'">
              <FAIcon icon="fa-solid fa-magnifying-glass icon" />&nbsp;&nbsp;<b>Data Explorer</b>
            </div>
            <div class="databar-panel-header-item info" v-if="api.dev.data_bar_tab == 'log'">
              <FAIcon icon="fa-solid fa-book icon" />&nbsp;&nbsp;<b>Narrative Log</b>
            </div>
          </div>

          <div class="databar-panel-header-end">
            <div class="databar-panel-header-item closebutton">
              <a class="databar-panel-header-item" @click="api.dev.show_data_bar = !api.dev.show_data_bar">
                <FAIcon icon="fa-solid fa-circle-xmark icon" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- content of panel here -->
      <DatabaseInfoPanel v-if="api.dev.data_bar_tab == 'database'"></DatabaseInfoPanel>
      <DatabaseBrowsePanel v-if="api.dev.data_bar_tab == 'browse'"></DatabaseBrowsePanel>
      <DatabaseLogPanel v-if="api.dev.data_bar_tab == 'log'"></DatabaseLogPanel>
    </section>
  </nav>
</template>

<style>
.databar-panel-header {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  position: relative;
}

.databar-panel-header-menu {
  flex-grow: 1;
  flex-shrink: 0;
  align-items: stretch;
  display: flex;
  z-index: 999;
}

.databar-panel-header-start {
  justify-content: flex-start;
  margin-inline-end: auto;
  display: flex;
  align-items: stretch;
  flex-shrink: 3;
  padding-left: 10px;
}

.databar-panel-header-end {
  justify-content: flex-end;
  margin-inline-start: auto;
  display: flex;
  align-items: stretch;
}

.databar-panel-header-item {
  align-items: center;
  display: flex;
}

.databar {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  position: relative;
}

.databar.is-fixed-bottom {
  bottom: 0;
}

.databar.is-fixed-bottom,
.databar.is-fixed-top {
  left: 0;
  position: fixed;
  right: 0;
  z-index: 500;
}

.devdatabar {
  border-top: var(--dev-bar-lines);
  background: #fff;
  color: #000;
  height: v-bind(height_pct);
  padding: 0px;
  margin: 0px;
  margin-bottom: 0px;
}

.datamenu {
  background: var(--dev-bar-mild-grey);
  min-width: 20px;
  padding-left: 2px;
  padding-top: 0px;
  border-right: var(--dev-bar-lines);
  flex-shrink: 0;
}

.menu-list {
  padding-top: 5px;
}
.menu-list li {
  font-size: 0.75em;
  text-align: left;
  padding-right: 3px;
  padding-top: 1px;
}

.menu-list a {
  background: inherit;
  color: var(--darker-grey);
}

.menu-list a:hover {
  background-color: rgb(167, 167, 167);
  color: #ffffff;
}

.info {
  color: #333;
}

.closebutton {
  padding-right: 10px;
}
</style>

<style scoped>
.menu-label {
  background: #eff2f3;
  color: #fff;
}
.secpanel {
  width: 100%;
  padding: 0;
  margin: 0;
  text-align: left;
  height: 100%;
}
.logpanel {
  width: 100%;
  font-size: 12px;
  background: var(--dev-bar-light-grey);
  /*background: rgb(210, 233, 240);*/
  color: #333;
  min-height: 30px;
  padding: 0px;
  margin: 0px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  border-top: none;
}

.labeltext {
  color: #000;
  width: 20%;
  font-weight: 700;
}

.icon {
  color: #f9d403;
}

.navbar-end {
  width: 100%;
}

.menu-label {
  font-size: 0.8em;
  text-align: left;
  padding-top: 10px;
  padding-left: 3px;
}

.active a {
  background: #8b8b8b;
  color: #393939;
}
.active a:hover {
  background: #8b8b8b;
  color: #393939;
}

.databar {
  padding: 0px;
  margin: 0px;
}

.container {
  width: 100%;
  padding: 0px;
  margin: 0px;
}
.columns {
  border: 1px solid;
  width: 100%;
}
.column {
  border: 1px solid;
  padding: 0px;
  margin: 0px;
  text-align: left;
}
</style>
