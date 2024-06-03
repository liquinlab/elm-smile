<script setup>
import { ref, reactive } from 'vue'
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()
import useSmileStore from '@/core/stores/smiledata'
const smilestore = useSmileStore() // load the global store

//const panel = reactive({ type: 'local', visible: false, x: -280, y: 0 })

function toggle_and_reset() {
  api.dev.config_panel.visible = !api.dev.config_panel.visible
  if (api.dev.config_panel.visible == false) {
    api.dev.config_panel.x = -280
    api.dev.config_panel.y = 0
  }
}
function onDragCallback(x, y) {
  api.dev.config_panel.x = x
  api.dev.config_panel.y = y
}

function createLink(option) {
  if (typeof option === 'string') {
    if (option.slice(0, 4) === 'http') {
      return `<a href='${option}' target='_new'>${option}</a>`
    }
  }
  return String(option)
}

function resetDevState() {
  localStorage.removeItem(api.config.dev_local_storage_key) // delete the local store
  api.dev.config_panel.visible = false
  location.reload()
}
</script>
<template>
  <div class="dropdown is-hoverable is-right" :class="{ 'is-active': api.dev.config_panel.visible }">
    <div class="dropdown-trigger">
      <button class="button devbar-button">
        <FAIcon icon="fa-solid fa-gear" />
      </button>
    </div>
    <div class="dropdown-menu pt-0 mt-0" id="dropdown-menu" role="menu">
      <vue-draggable-resizable
        :x="api.dev.config_panel.x"
        :y="api.dev.config_panel.y"
        :draggable="api.dev.config_panel.visible"
        :resizable="false"
        :onDrag="onDragCallback"
      >
        <div class="dropdown-content">
          <div class="pin" :class="{ 'pin-selected': api.dev.config_panel.visible }">
            <a @click="toggle_and_reset()">
              <FAIcon icon=" fa-solid fa-thumbtack" />
            </a>
          </div>
          <div class="datapanel has-text-left">
            <h1 class="title is-6">Configuration</h1>
            <p class="is-left">
              Welcome to the configuration page for your project. This page can help you understand the application
              state. Read more about configuration options
              <a href="https://smile.gureckislab.org/configuration.html">in the docs</a>.
            </p>
            <br />
            <div class="tabs is-small is-centered">
              <ul>
                <li :class="{ 'is-active': api.dev.config_panel.type == 'local' }">
                  <a @click="api.dev.config_panel.type = 'local'"><b> Local State </b></a>
                </li>
                <li :class="{ 'is-active': api.dev.config_panel.type == 'dev' }">
                  <a @click="api.dev.config_panel.type = 'dev'"><b>Dev Mode State</b></a>
                </li>
                <li :class="{ 'is-active': api.dev.config_panel.type == 'code' }">
                  <a @click="api.dev.config_panel.type = 'code'"><b> Code Version </b></a>
                </li>
                <li :class="{ 'is-active': api.dev.config_panel.type == 'full' }">
                  <a @click="api.dev.config_panel.type = 'full'"><b>Full Config</b></a>
                </li>
              </ul>
            </div>
            <div class="datapanel" v-if="api.dev.config_panel.type == 'local'">
              <div class="code">
                <div class="resetbutton has-tooltip-arrow has-tooltip-bottom" data-tooltip="Reset local state">
                  <a class="button is-small" @click="api.resetLocalState()">
                    <b>Reset local:</b> <FAIcon icon=" fa-solid fa-arrow-rotate-left" />
                  </a>
                </div>
                <ul>
                  <li class="config" v-for="(option, key) in smilestore.local" :key="key">
                    <span v-if="typeof option != 'object' || option === undefined || option === null">
                      <b>{{ key }}</b
                      >: <span v-html="createLink(option)"></span>
                    </span>
                    <span v-else>
                      <b>{{ key }}</b
                      >:
                      <ul>
                        <li v-for="(option2, key2) in option" :key="key2">
                          <b>{{ key2 }}</b
                          >: <span v-html="createLink(option2)"></span>
                        </li>
                      </ul>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="configinfo" v-if="api.dev.config_panel.type == 'code'">
              <div class="datapanel">
                <div class="code">
                  <ul>
                    <li class="config" v-for="(option, key) in smilestore.config.github" :key="key">
                      <b>{{ key }}</b
                      >: <span v-html="createLink(option)"></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="configinfo" v-if="api.dev.config_panel.type == 'full'">
              <div class="datapanel">
                <div class="code">
                  <ul>
                    <li class="config" v-for="(option, key) in smilestore.config" :key="key">
                      <span v-if="typeof option == 'string'">
                        <b>{{ key }}</b
                        >: <span v-html="createLink(option)"></span>
                      </span>
                      <span v-else>
                        <b>{{ key }}</b
                        >:
                        <ul>
                          <li v-for="(option2, key2) in option" :key="key2">
                            <b>{{ key2 }}</b
                            >: <span v-html="createLink(option2)"></span>
                          </li>
                        </ul>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="configinfo" v-if="api.dev.config_panel.type == 'dev'">
              <div class="datapanel">
                <div class="code">
                  <div
                    class="resetbutton has-tooltip-arrow has-tooltip-bottom"
                    data-tooltip="Reset developer interface"
                  >
                    <a class="button is-small" @click="resetDevState()">
                      <b>Reset dev:</b> <FAIcon icon=" fa-solid fa-arrow-rotate-left" />
                    </a>
                  </div>
                  <ul>
                    <li class="config" v-for="(option, key) in smilestore.dev" :key="key">
                      <span v-if="typeof option != 'object' || option === undefined || option === null">
                        <b>{{ key }}</b
                        >: <span v-html="createLink(option)"></span>
                      </span>
                      <span v-else>
                        <b>{{ key }}</b
                        >:
                        <ul>
                          <li v-for="(option2, key2) in option" :key="key2">
                            <b>{{ key2 }}</b
                            >: <span v-html="createLink(option2)"></span>
                          </li>
                        </ul>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </vue-draggable-resizable>
    </div>
  </div>
</template>

<style scoped>
.dropdown-content {
  padding: 0;
  padding-top: 8px;
  margin: 0;
  width: 500px;
  text-align: left;
}

.resetbutton {
  float: right;
  margin: 0;
  padding-right: 5px;
  color: #000;
}
.pin {
  float: right;
  margin: 0;
  padding-right: 15px;
  color: #fff;
}

.pin a {
  color: #ccc;
}

.pin-selected a {
  color: #42b983;
}

.datapanel {
  padding: 15px;
  text-align: left;
  width: 500px;
}

a {
  color: #42b983;
}

.tabs {
  margin-bottom: 0px;
}

.config {
  text-align: left;
  margin-left: 20px;
  font-family: monospace;
  font-size: 0.9em;
  font-weight: 500;
}

.config a {
  color: #0b8a9b;
}

.config b {
  color: #639aa6;
}

.config li {
  padding-left: 35px;
}

.code {
  background: rgb(251, 251, 251);
  margin: auto;
  margin-top: 0px;
  margin-right: 25px;
  padding: 10px;
  word-wrap: break-word;
}

.code p {
  text-align: left;
  font-size: 0.9em;
}
</style>
