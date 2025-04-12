<script setup>
import { computed } from 'vue'

const props = defineProps(['data', 'selected'])
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
const emit = defineEmits(['selected'])

const height_pct = computed(() => `${api.store.dev.consoleBarHeight - 90}px`)

const header = computed(() => {
  if (props.data === undefined || props.data === null) {
    return null
  } else {
    var pieces = props.data.split('.')
    return pieces[pieces.length - 1]
  }
})

const data_field = computed(() => {
  if (props.data !== undefined && props.data !== null) {
    var pieces = props.data.split('.')
    var view_data = api.all_config
    for (var i = 0; i < pieces.length; i++) {
      if (view_data[pieces[i]]) {
        view_data = view_data[pieces[i]]
      }
    }
    return view_data
  } else {
    return null
  }
})

function truncateText(text, maxLength = 30) {
  if (!text) return text
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function option_selected(option) {
  emit('selected', option)
}
</script>

<template>
  <aside class="menu">
    <div class="columnheader" v-if="header">
      <template v-if="header == '/'"><FAIcon icon="fa-solid fa-home" />&nbsp;</template>
      <template v-else>{{ header }}</template>
    </div>

    <ul class="menu-list">
      <div
        v-if="
          (data_field === null || data_field === undefined || Object.keys(data_field).length == 0) && header !== null
        "
      >
        <li>
          <a>Empty currently</a>
        </li>
      </div>
      <li v-for="(option, key) in data_field" :class="{ active: key === props.selected }">
        <div v-if="option === null || (typeof option != 'object' && !Array.isArray(option))">
          <a>
            <b>{{ truncateText(key) }}</b
            >: {{ option === null ? 'null' : truncateText(String(option)) }}
          </a>
        </div>
        <div v-else @click="option_selected(key)">
          <a>
            <b>{{ truncateText(key) }}</b>
            <div class="arrow">
              <FAIcon icon=" fa-solid fa-angle-right" />
            </div>
          </a>
        </div>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.active a {
  background-color: rgb(199, 215, 228);
  color: #fff;
}
.active a:hover {
  background-color: rgb(199, 215, 228);
  color: #fff;
}
.active li a {
  color: #fff;
}

.columnheader {
  background: #f4f4f4;
  color: #858484;
  padding: 5px;
  font-size: 0.8em;
  margin-bottom: 0px;
  padding-left: 10px;
}

.menu-list {
  height: v-bind(height_pct);
  overflow-y: scroll;
  overflow-x: hidden;
}
.menu-list li {
  font-size: 0.73em;
  font-family: monospace;
  margin-top: 2px;
  margin-right: 4px;
  margin-left: 4px;
}

.menu-list li a {
  color: #717a80;
  padding-top: 5px;
}

.menu-list li b {
  color: steelblue;
}

.arrow {
  float: right;
  margin: 0px;
  padding-right: 0px;
  color: #434343;
  vertical-align: middle;
  padding: 0px;
  font-size: 0.9em;
  margin-top: 3px;
}
</style>
