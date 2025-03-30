<script setup>
import { ref, reactive, watch } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
import { useRouter } from 'vue-router'
const router = useRouter()
import useSmileStore from '@/core/stores/smilestore'
const smilestore = useSmileStore() // load the global store
const seed = ref(smilestore.getSeedID)
import { v4 as uuidv4 } from 'uuid'
import TextInputWithButton from '@/dev/developer_mode/TextInputWithButton.vue'

function toggle_and_reset() {
  api.store.dev.randomization_panel.visible = !api.store.dev.randomization_panel.visible
  if (api.store.dev.randomization_panel.visible == false) {
    api.store.dev.randomization_panel.x = -130
    api.store.dev.randomization_panel.y = 0
  }
}

function onDragCallback(x, y) {
  api.store.dev.randomization_panel.x = x
  api.store.dev.randomization_panel.y = y
}

function randomize_seed() {
  // seed.value = uuidv4()
  //seed = smilestore.randomizeSeed()
  api.debug('Setting seed to ', seed.value)
  smilestore.setSeedID(seed.value)
  // Force a reload to resample conditions and variables
  router.go(0)
}

// define selected condition in toolbar from current conditions
const selected = smilestore.getConditions

// when toolbar selection changes, change conditions in the data
function changeCond(key, event) {
  const cond = event.target.value
  smilestore.setCondition(key, cond)
  // Force a reload to resample conditions and variables
  router.go(0)
}

// when condition is set in the data, update the toolbar conditions
watch(
  () => smilestore.data.conditions,
  async (newConds) => {
    // for each key in newConds, update that entry in conditions
    Object.keys(newConds).forEach((key) => {
      selected[key] = newConds[key]
    })
  }
)
</script>
<template>
  <div class="dropdown is-hoverable is-right" :class="{ 'is-active': api.store.dev.randomization_panel.visible }">
    <div class="dropdown-trigger">
      <button class="button devbar-button">
        <FAIcon icon=" fa-solid fa-dice" />
      </button>
    </div>

    <div class="dropdown-menu pt-0 mt-0" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <div class="pin" :class="{ 'pin-selected': api.store.dev.randomization_panel.visible }">
          <a @click="toggle_and_reset()">
            <FAIcon icon=" fa-solid fa-thumbtack" />
          </a>
        </div>
        <div class="randomization is-right">
          <h1 class="title is-6">Seeded Randomization</h1>
          <p class="is-left">
            You have the option of manually setting the seed id, which is used to seed random number generators
            throughout the experiment. To do so, replace the value in the textbox with the desired seed id and click the
            green reset button before proceeding. Read more about randomization
            <a href="https://smile.gureckislab.org/randomization.html">in the docs</a>.
          </p>
          <br />
          <table class="table is-fullwidth">
            <tbody>
              <tr>
                <th width="30%"></th>
                <th></th>
              </tr>
              <tr>
                <td class="has-text-left"><b>Fixed Seed</b>:</td>
                <td class="has-text-left is-family-code is-size-7">
                  <div class="field">
                    <input
                      id="switchRoundedDefault"
                      type="checkbox"
                      name="switchRoundedDefault"
                      class="switch is-rounded is-rtl is-small"
                      v-model="smilestore.local.useSeed"
                    />
                    <label for="switchRoundedDefault"></label>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="has-text-left"><b>Seed</b>:</td>
                <td class="has-text-left is-family-code is-size-7">
                  <div class="textinput">
                    <input
                      class="input is-small"
                      type="text"
                      placeholder="Current seed"
                      size="15"
                      width="10"
                      v-model="seed"
                    />
                    <button
                      class="button is-small is-light removeedge has-tooltip-arrow has-tooltip-top"
                      data-tooltip="Set new seed"
                      @click="randomize_seed()"
                    >
                      <FAIcon icon="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                  <!-- <TextInputWithButton :v-model="seed"
                      :seed="seed"
                      tooltip="Set new seed"
                      @action="randomize_seed()"
                    ></TextInputWithButton> -->
                </td>
              </tr>
            </tbody>
          </table>
          <div class="field"></div>

          <h1 class="title is-6">Random variables</h1>
          <p class="is-left">
            Read more about randomization
            <a href="https://smile.gureckislab.org/randomization.html"> in the docs </a>.
          </p>
          <br />
          <table class="table is-fullwidth">
            <tbody>
              <template v-for="(value, key) in smilestore.local.possibleConditions" :key="key">
                <tr>
                  <td width="30%">
                    <b>{{ key }}:</b>
                  </td>
                  <td>
                    <div class="select is-small">
                      <select v-model="selected[key]" @change="changeCond(key, $event)">
                        <option disabled value="">[not selected]</option>
                        <option v-for="cond in value" :key="cond">
                          {{ cond }}
                        </option>
                      </select>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
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

.textinput {
  border: 0.1em solid #d2d2d2;
  border-radius: var(--bulma-radius-small);
  width: 100%;
  display: inline-block;
  position: relative;
  padding-left: 2px;
}
.textinput input {
  border: none;
  padding-right: 30px;
  font-family: var(--bulma-code);
  font-size: 0.85em;
  min-height: 30px;
}
.textinput button {
  position: absolute;
  right: 2px;
  top: 3px;
  padding: 7px;
  margin-right: 0px;
  margin-left: auto;
  border: none;
  box-shadow: none;
  background: #fff;
}
</style>
