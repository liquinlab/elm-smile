<script setup>
import ConsoleLogPanel from '@/dev/developer_mode/ConsoleLogPanel.vue'
import ConsoleDatabaseBrowsePanel from '@/dev/developer_mode/ConsoleDatabaseBrowsePanel.vue'
import ConsoleConfigPanel from '@/dev/developer_mode/ConsoleConfigPanel.vue'

import useAPI from '@/core/composables/useAPI'
const api = useAPI()
</script>

<template>
  <nav class="databar">
    <aside class="menu datamenu">
      <ul class="menu-list">
        <li :class="{ active: api.store.dev.consoleBarTab == 'browse' }">
          <a
            @click="api.store.dev.consoleBarTab = 'browse'"
            class="has-tooltip-arrow has-tooltip-right"
            data-tooltip="Data Explorer"
          >
            <FAIcon icon="fa-solid fa-magnifying-glass icon" />
          </a>
        </li>

        <li :class="{ active: api.store.dev.consoleBarTab == 'log' }">
          <a
            @click="api.store.dev.consoleBarTab = 'log'"
            class="has-tooltip-arrow has-tooltip-right"
            data-tooltip="Narrative Log"
          >
            <FAIcon icon="fa-solid fa-book icon" />
          </a>
        </li>

        <li :class="{ active: api.store.dev.consoleBarTab == 'config' }">
          <a
            @click="api.store.dev.consoleBarTab = 'config'"
            class="has-tooltip-arrow has-tooltip-right"
            data-tooltip="Configuration"
          >
            <FAIcon icon="fa-solid fa-gear icon" />
          </a>
        </li>
      </ul>
    </aside>

    <section class="section secpanel">
      <nav class="databar-panel-header logpanel" role="navigation" aria-label="data navigation">
        <div id="navbardatabase" class="databar-panel-header-menu">
          <div class="databar-panel-header-start">
            <div class="databar-panel-header-item info" v-if="api.store.dev.consoleBarTab == 'browse'">
              <FAIcon icon="fa-solid fa-magnifying-glass icon" />&nbsp;&nbsp;<b>Data Explorer</b>
            </div>
            <div class="databar-panel-header-item info" v-if="api.store.dev.consoleBarTab == 'log'">
              <FAIcon icon="fa-solid fa-book icon" />&nbsp;&nbsp;<b>Narrative Log</b>
            </div>
            <div class="databar-panel-header-item info" v-if="api.store.dev.consoleBarTab == 'config'">
              <FAIcon icon="fa-solid fa-gear icon" />&nbsp;&nbsp;<b>Configuration</b>
            </div>
          </div>

          <div class="databar-panel-header-end"></div>
        </div>
      </nav>

      <!-- content of panel here -->
      <ConsoleDatabaseBrowsePanel v-if="api.store.dev.consoleBarTab == 'browse'"></ConsoleDatabaseBrowsePanel>
      <ConsoleLogPanel v-if="api.store.dev.consoleBarTab == 'log'"></ConsoleLogPanel>
      <ConsoleConfigPanel v-if="api.store.dev.consoleBarTab == 'config'"></ConsoleConfigPanel>
    </section>
  </nav>
</template>

<style scoped>
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
  width: 100%;
  border-top: var(--dev-bar-lines);
  background: #fff;
  color: #000;
  height: 100%;
  padding: 0px;
  margin: 0px;
  margin-bottom: 0px;
  overflow-y: hidden;
}

.databar.is-fixed-bottom,
.databar.is-fixed-top {
  left: 0;
  position: fixed;
  right: 0;
  z-index: 500;
}

.datamenu {
  background: var(--dev-bar-mild-grey);
  min-width: 20px;
  padding-left: 2px;
  padding-top: 0px;
  border-right: var(--dev-bar-lines);
  flex: 0 0 auto;
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
  padding-right: 0px;
  padding-left: 10px;
  width: 40px;
}
.secpanel {
  width: 100%;
  padding: 0;
  margin: 0;
  text-align: left;
  height: 100%;
  flex: 1 1 auto;
}

.menu-label {
  background: #eff2f3;
  color: #fff;
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
