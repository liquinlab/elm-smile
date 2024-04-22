<script setup>
import { reactive, computed, onMounted } from 'vue'
import DatabaseList from '@/components/navbars/DatabaseList.vue'
import SmileAPI from '@/core/composables/smileapi'
const api = SmileAPI()

const browse_panels = reactive({ path: ['data', null, null] })

onMounted(() => {
  if (api.dev.data_path !== null) {
    browse_panels.path = JSON.parse(api.dev.data_path) // hydrate from api/localstorage
  }
})

function save_path() {
  api.dev.data_path = JSON.stringify(browse_panels.path)
}

const n_active_panels = computed(() => {
  var count = 0
  for (var i = 0; i < browse_panels.path.length; i++) {
    if (browse_panels.path[i] !== null) {
      count++
    }
  }
  return count
})

function panel_path(cutoff) {
  var path = ''
  if (browse_panels.path[browse_panels.path.length - cutoff - 1] == null) {
    return null
  } else {
    for (var i = 0; i < browse_panels.path.length - cutoff; i++) {
      path += String(browse_panels.path[i])
      if (i < browse_panels.path.length - cutoff - 1) {
        path += '.'
      }
    }
    return path
  }
}

function panel1_select(option) {
  browse_panels.path.pop()
  browse_panels.path.pop()
  browse_panels.path.push(String(option))
  if (browse_panels.path.length < 3) {
    browse_panels.path.push(null)
  }
  save_path()
}

function panel2_select(option) {
  browse_panels.path.pop()
  browse_panels.path.push(String(option))
  save_path()
}

function panel3_select(option) {
  browse_panels.path.push(String(option))
  save_path()
}
function panel_jump(index) {
  // for everything after index set to null
  for (var i = index + 1; i < browse_panels.path.length; i++) {
    browse_panels.path[i] = null
  }
  // trim browse_panels to length three
  browse_panels.path = browse_panels.path.slice(0, 3)
  /*
  for (var i = index; i < index; i++) {
    browse_panels.path.push(null)
  }
  */
}
</script>
<template>
  <!-- content of panel here -->
  <!-- <FAIcon icon="fa-solid fa-home" />&nbsp;&nbsp; -->
  <!--         <li><a @click="panel1_select(null)">data</a></li> -->
  <div class="contentpanel">
    <nav class="breadcrumb has-arrow-separator" aria-label="breadcrumbs">
      <ul>
        <template v-for="(option, index) in browse_panels.path">
          <li v-if="option !== null" :class="{ 'is-active': index == n_active_panels - 1 }">
            <a @click="panel_jump(index)">
              <template v-if="option == 'data'"><FAIcon icon="fa-solid fa-home" />&nbsp;&nbsp;</template>{{ option }}
            </a>
          </li>
        </template>
      </ul>
    </nav>
    <div class="columns colcontent is-mobile">
      <div class="column colcontent is-3 edge">
        <!-- two from end -->
        <DatabaseList
          :data="panel_path(2)"
          :selected="browse_panels.path[browse_panels.path.length - 2]"
          @selected="panel1_select"
        ></DatabaseList>
      </div>
      <div class="column colcontent is-3 edge isdark">
        <!-- one from end -->
        <DatabaseList
          :data="panel_path(1)"
          :selected="browse_panels.path[browse_panels.path.length - 1]"
          @selected="panel2_select"
        ></DatabaseList>
      </div>
      <div class="column colcontent is-6 edge isdark">
        <!-- zero from end -->
        <DatabaseList :data="panel_path(0)" @selected="panel3_select"></DatabaseList>
      </div>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb {
  padding: 5px;
  padding-top: 5px;
  padding-bottom: 4px;
  padding-left: 10px;
  margin: 0px;
  height: 30px;
  background-color: #eeeeee;
  border-bottom: 1px solid #ccc;
  border-top: 1px solid #ccc;
  font-size: 0.8em;
  color: #656565;
}
.contentpanel {
  padding-left: 0px;
  margin: 0px;
  height: 100%;
}
.colcontent {
  height: 100%;
  margin: 0;
  padding: 0;
}

.edge {
  border-right: 1px solid #e3e3e3;
  margin: 0px;
  padding: 0px;
}
</style>
