<script setup>
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()
import useSmileStore from '@/core/stores/smiledata'
const smilestore = useSmileStore() // load the global store

function toggle_and_reset() {
  api.dev.state_var_panel.visible = !api.dev.state_var_panel.visible
  if (api.dev.state_var_panel.visible == false) {
    api.dev.state_var_panel.x = -150
    api.dev.state_var_panel.y = 0
  }
}
function onDragCallback(x, y) {
  api.dev.state_var_panel.x = x
  api.dev.state_var_panel.y = y
}
</script>
<template>
  <div class="dropdown is-hoverable is-right" :class="{ 'is-active': api.dev.state_var_panel.visible }">
    <div class="dropdown-trigger">
      <button class="button devbar-button">
        <FAIcon icon=" fa-solid fa-hand" />
      </button>
    </div>
    <div class="dropdown-menu pt-0 mt-0" id="dropdown-menu" role="menu">
      <vue-draggable-resizable
        :x="api.dev.state_var_panel.x"
        :y="api.dev.state_var_panel.y"
        :draggable="api.dev.state_var_panel.visible"
        :resizable="false"
        :onDrag="onDragCallback"
      >
        <div class="dropdown-content">
          <div class="pin" :class="{ 'pin-selected': api.dev.state_var_panel.visible }">
            <a @click="toggle_and_reset()">
              <FAIcon icon=" fa-solid fa-thumbtack" />
            </a>
          </div>
          <div class="randomization is-right">
            <h1 class="title is-6">Manipulate State</h1>
            <p class="is-left">You can override or view certain user-relevant state variables for testing purposes.</p>
            <br />
            <table class="table is-hoverable is-striped is-fullwidth">
              <tr>
                <th width="40%"></th>
                <th></th>
              </tr>
              <tr>
                <td class="has-text-left"><b>Is known:</b></td>
                <td class="has-text-left is-family-code is-size-7">
                  <div class="field">
                    <input
                      id="switchRoundedDefault1"
                      type="checkbox"
                      name="switchRoundedDefault1"
                      class="switch is-rounded is-rtl is-small"
                      v-model="smilestore.local.knownUser"
                    />
                    <label for="switchRoundedDefault1"></label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="has-text-left"><b>Has consented:</b></td>
                <td class="has-text-left is-family-code is-size-7">
                  <div class="field">
                    <input
                      id="switchRoundedDefault3"
                      type="checkbox"
                      name="switchRoundedDefault3"
                      class="switch is-rounded is-rtl is-small"
                      v-model="smilestore.local.consented"
                    />
                    <label for="switchRoundedDefault3"></label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="has-text-left"><b>Is done:</b></td>
                <td class="has-text-left is-family-code is-size-7">
                  <div class="field">
                    <input
                      id="switchRoundedDefault2"
                      type="checkbox"
                      name="switchRoundedDefault2"
                      class="switch is-rounded is-rtl is-small"
                      v-model="smilestore.local.done"
                    />
                    <label for="switchRoundedDefault2"></label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="has-text-left"><b>Withdrew:</b></td>
                <td class="has-text-left is-family-code is-size-7">
                  <div class="field">
                    <input
                      id="switchRoundedDefault4"
                      type="checkbox"
                      name="switchRoundedDefault4"
                      class="switch is-rounded is-rtl is-small"
                      v-model="smilestore.local.withdrawn"
                    />
                    <label for="switchRoundedDefault4"></label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="has-text-left"><b>Service:</b></td>
                <td class="has-text-left is-family-code is-size-7">
                  <div class="control select is-small">
                    <select id="recruitment" v-model="smilestore.data.recruitment_service" class="select is-small">
                      <option v-for="(cond, key) in smilestore.global.urls" :key="cond">
                        {{ key }}
                      </option>
                    </select>
                  </div>
                </td>
              </tr>
            </table>
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
  width: 350px;
  text-align: left;
  padding-bottom: 20px;
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

.randomization {
  width: 350px;
  padding: 15px;
  text-align: left;
}

.randomization a {
  color: #0b8a9b;
}
</style>
