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

// Add this function from TreeNode.vue
const getBranchType = (index, total) => {
  if (index === 0) {
    return '┌─ '
  } else if (index === total - 1) {
    return '└─ '
  } else {
    return '├─ '
  }
}
</script>
<template>
  <div class="randomization-info-sidebar-panel">
    <div
      class="subsection"
      v-if="smilestore.local.possibleConditions && Object.keys(smilestore.local.possibleConditions).length > 0"
    >
      <div class="sectitle">Random Variables</div>

      <!-- -->

      <div class="randomization-conditions-list-container">
        <ul class="conditions-list">
          <template v-for="(value, key, index) in smilestore.local.possibleConditions" :key="key">
            <li>
              <span class="tree-branch">{{
                getBranchType(index, Object.keys(smilestore.local.possibleConditions).length)
              }}</span>
              <div class="select is-small mb-1">
                <select v-model="selected[key]" @change="changeCond(key, $event)">
                  <option v-for="cond in value" :key="cond" :value="cond">{{ key }}: {{ cond }}</option>
                </select>
              </div>
            </li>
          </template>
        </ul>
        <div class="randomization-note">see design.js</div>
      </div>
    </div>
    <div class="sectitle">Set seed</div>
    <div class="randomization-seed-container">
      <div class="columns is-mobile m-0 p-0">
        <div class="column is-2 p-0">
          <div class="field has-tooltip-arrow has-tooltip-right" data-tooltip="Use fixed seed">
            <input
              id="switchRoundedDefault"
              type="checkbox"
              name="switchRoundedDefault"
              class="switch is-rounded is-rtl is-small"
              v-model="smilestore.local.useSeed"
            />
            <label for="switchRoundedDefault"></label>
          </div>
        </div>
        <div class="column is-10 p-0">
          <div class="textinput">
            <input class="input is-small" type="text" placeholder="Current seed" size="15" width="10" v-model="seed" />
            <button
              class="button is-small is-light removeedge has-tooltip-arrow has-tooltip-left"
              data-tooltip="Set new seed"
              @click="randomize_seed()"
            >
              <FAIcon icon="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.randomization-info-sidebar-panel {
  height: fit-content;
  padding: 0px 0 0 0;
  margin: 0;
  background-color: #fff;
}
.randomization-conditions-list-container {
  position: relative;
  margin: 0;
  padding: 0;
  padding-top: 6px;
}
.randomization-note {
  font-size: 0.4em;
  color: #666;
  position: absolute;
  top: 0;
  right: 0.3rem;
}
.randomization-seed-container {
  margin-top: 0px;
  padding: 0px;
  z-index: 2000;
}
.sectitle {
  font-size: 0.7em;
  text-align: left;
  font-weight: 800;
  color: #484e4e;
  background-color: #f0f0f0;
  padding: 0.4rem 0.5rem;
  margin: 0rem 0rem 0px 0;
  border-top: 1px solid #d2d2d2;
  border-bottom: 1px solid #d2d2d2;
}
.select select {
  font-size: 0.9em;
  font-family: monospace;
  font-weight: bold;
  color: #3b7e7e;
}
.collabel {
  font-size: 0.7em;
}

.textinput {
  border: 0.1em solid #d2d2d2;
  border-radius: var(--bulma-radius-small);
  width: 180px;
  display: inline-block;
  position: relative;
  font-size: 0.7em;
  margin-left: 4px;
  margin-right: auto;
  margin-bottom: 0.5rem;
}
.textinput input {
  border: none;
  padding-right: 30px;
  font-family: var(--bulma-code);
  font-size: 0.85em;
  min-height: 20px;
}
.textinput button {
  position: absolute;
  right: 2px;
  top: 0px;
  padding: 6px;
  margin-right: 0px;
  margin-left: auto;
  border: none;
  box-shadow: none;
  background: #fff;
}

/* Add this new style for columns spacing */
.columns.mb-0 {
  margin-bottom: 0 !important;
}

.conditions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  margin-left: 0.4rem;
}

.conditions-list li {
  display: flex;
  align-items: center;
  margin-bottom: 0rem;
  margin-left: 0.2rem;
}

.tree-branch {
  font-family: monospace;
  font-size: 0.9em;
  color: #666;
  white-space: pre;
  margin-right: 0rem;
}
</style>
