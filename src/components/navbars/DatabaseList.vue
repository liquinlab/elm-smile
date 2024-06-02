<script setup>
import { computed } from 'vue'

const props = defineProps(['data', 'selected'])
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()
const emit = defineEmits(['selected'])

const height_pct = computed(() => `${api.dev.data_bar_height - 100}px`)

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
    var view_data = api.data
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
function option_selected(option) {
  emit('selected', option)
}
</script>

<template>
  <aside class="menu">
    <div class="columnheader" v-if="header">{{ header }}</div>

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
            <b>{{ key }}</b
            >: {{ option === null ? 'null' : option }}
          </a>
        </div>
        <div v-else @click="option_selected(key)">
          <a>
            <b>{{ key }}</b>
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
  margin-bottom: 10px;
  padding-left: 10px;
}
.menu-list {
  height: v-bind(height_pct);
  overflow-y: scroll;
  overflow-x: hidden;
}
.menu-list li {
  font-size: 0.8em;
  font-family: monospace;
}

.menu-list li a {
  color: #717a80;
  padding-top: 2px;
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
}
</style>
