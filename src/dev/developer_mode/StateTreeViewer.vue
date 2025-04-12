<script setup>
import { ref, computed, watch, onMounted, defineComponent, h } from 'vue'
import TreeNode from './TreeNode.vue'
import DataPathViewer from '@/dev/developer_mode/DataPathViewer.vue'
import useAPI from '@/core/composables/useAPI'
import { useRoute } from 'vue-router'

const api = useAPI()
const route = useRoute()

// Reactively get the stepper for the current page
const stepper = computed(() => {
  return api.store.global.steppers?.[route.name]
})

// Add a watcher to handle stepper initialization
watch(
  () => api.store.global.steppers?.[route.name],
  (newStepper) => {
    if (newStepper) {
      // Force a component update when stepper becomes available
      console.log('Stepper initialized:', route.name)
    }
  },
  { immediate: true } // This will run the watcher immediately on component mount
)

const stateMachine = computed(() => stepper.value?.smviz)

// Update the path watcher to use stepper.value
watch(
  () => stepper.value?.path,
  (newPath) => {
    console.log('Path watcher triggered:', {
      newPath,
      stepper: stepper.value,
    })
  },
  { immediate: true }
)

// Convert array path to string format (e.g., [1, 1] -> "1-1")
const pathToString = (pathArray) => {
  return Array.isArray(pathArray) ? pathArray.join('-') : ''
}

// Add computed property to check if a node is selected
const isNodeSelected = (nodePath) => {
  if (!stepper.value?.path) return false
  const currentPathStr = pathToString(stepper.value.path)
  return nodePath === currentPathStr
}

// Function to format object with indentation
const formatObjectWithIndent = (obj, indent = 0, seen = new WeakSet()) => {
  if (obj === null || obj === undefined) return 'null'

  // Handle circular references
  if (typeof obj === 'object' && seen.has(obj)) {
    return '[Circular]'
  }

  const spaces = ' '.repeat(indent * 2) // 2 spaces per indent level

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    seen.add(obj)
    const items = obj.map((item) => formatObjectWithIndent(item, indent + 1, seen)).join(',\n' + spaces + '  ')
    return `[\n${spaces}  ${items}\n${spaces}]`
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
    if (entries.length === 0) return '{}'
    seen.add(obj)
    const items = entries
      .map(([key, value]) => {
        const formattedValue = formatObjectWithIndent(value, indent + 1, seen)
        return `${key}: ${formattedValue}`
      })
      .join(', ')
    return `{ ${items} }`
  }

  // Handle primitive values
  if (typeof obj === 'string') return `"${obj}"`
  return String(obj)
}

// You can now use this instead of the current rootNode display
const formattedRootNode = computed(() => {
  return formatObjectWithIndent(stateMachine.value)
})

// Function to format data for display
const formatData = (data) => {
  if (data === null || data === undefined) return ''

  try {
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data)
      if (keys.length > 0) {
        // Show up to 3 key-value pairs
        const previewKeys = keys.slice(0, 3)
        const preview = previewKeys
          .map((k) => {
            const val = data[k]
            const valStr =
              typeof val === 'object'
                ? '{...}'
                : typeof val === 'string'
                  ? `"${val.substring(0, 15)}${val.length > 15 ? '...' : ''}"`
                  : String(val)
            return `${k}: ${valStr}`
          })
          .join(', ')
        return `{${preview}${keys.length > 3 ? ', ...' : ''}}`
      }
      return '{}'
    } else if (Array.isArray(data)) {
      return `[${data.length > 0 ? '...' + data.length + ' items...' : ''}]`
    } else {
      return `(${String(data)})`
    }
  } catch (e) {
    return '(data)'
  }
}

const handleNodeClick = (path) => {
  console.log('Node clicked with path:', path)
  if (stepper.value) {
    stepper.value.goToStep(path)
    // Scroll will happen via the watcher
  } else {
    console.warn('Stepper not available for path reset')
  }
}

// Add this function to handle reload
const handleReload = () => {
  window.location.reload()
}

const isEndState = computed(() => {
  if (!stepper.value) return false
  return stepper.value.paths === 'SOS' || stepper.value.paths === 'EOS'
})

// Add refs for container and selected node tracking
const treeContainer = ref(null)

const scrollToSelectedNode = () => {
  if (!stepper.value?.path) return

  setTimeout(() => {
    // Use the component's scope to find the selected node
    if (!treeContainer.value) return

    const selectedNode = treeContainer.value.querySelector('.node-selected')
    if (!selectedNode) return

    try {
      // Get the container's scroll position and dimensions
      const container = treeContainer.value
      const containerRect = container.getBoundingClientRect()
      const nodeRect = selectedNode.getBoundingClientRect()

      // Calculate the relative position of the node within the container
      const relativeTop = nodeRect.top - containerRect.top
      const relativeBottom = nodeRect.bottom - containerRect.top

      // Calculate the center position we want
      const targetPosition = relativeTop - containerRect.height / 2 + nodeRect.height / 2

      // Smoothly scroll to the target position
      container.scrollTop += targetPosition
    } catch (e) {
      console.error('Error scrolling to selected node:', e)
    }
  }, 100)
}

// Add watcher for path changes to trigger scroll
watch(
  () => stepper.value?.path,
  (newPath) => {
    if (newPath) {
      scrollToSelectedNode()
    }
  }
)
</script>

<template>
  <div class="tree-viewer-container" v-if="stepper">
    <div class="path-display-container">
      <div class="path-info">
        <div class="path-display">{{ stepper.paths }}</div>

        &nbsp;<FAIcon icon="fa-solid fa-ban" v-if="isEndState" />
      </div>

      <div class="field has-addons">
        <p class="control">
          <button @click="stepper.goPrevStep()" class="button is-small nav-button">
            <span><FAIcon icon="fa-solid fa-angle-left" /></span>
          </button>
        </p>
        <p class="control">
          <button @click="stepper.goNextStep()" class="button is-small nav-button">
            <span><FAIcon icon="fa-solid fa-angle-right" /></span>
          </button>
        </p>
        <p class="control">
          <button @click="stepper.reset()" class="button is-small nav-button">
            <span><FAIcon icon="fa-solid fa-house-flag" /></span>
          </button>
        </p>
        <p class="control">
          <button @click="stepper.clear()" class="button is-small nav-button">
            <span><FAIcon icon="fa-solid fa-trash" /></span>
          </button>
        </p>
        <p class="control">
          <button @click="handleReload" class="button is-small nav-button">
            <span><FAIcon icon="fa-solid fa-arrow-rotate-left" /></span>
          </button>
        </p>
      </div>
    </div>

    <div class="tree-container" ref="treeContainer">
      <div class="index-display">{{ stepper.stepIndex }}/{{ stepper.nSteps }}</div>

      <ul class="tree-root">
        <li v-if="stateMachine" class="tree-node root-node">
          <ul v-if="stateMachine.rows && stateMachine.rows.length > 0" class="children">
            <TreeNode
              v-for="(state, index) in stateMachine.rows"
              :key="index"
              :state="state"
              :index="index"
              :total="stateMachine.rows.length"
              :is-node-selected="isNodeSelected"
              :format-data="formatData"
              :depth="1"
              :max-depth="5"
              :vertical-lines="[]"
              @node-click="handleNodeClick"
            />
          </ul>
        </li>
      </ul>
    </div>
    <div class="data-container-global">
      <div class="global-data-display">
        Global Vars
        <span class="data-label">(.globals)</span>

        <button
          @click="stepper.clearGlobals()"
          class="button is-small nav-button-small has-tooltip-arrow has-tooltip-bottom"
          data-tooltip="Delete Global Variables"
        >
          <span><FAIcon icon="fa-solid fa-trash" /></span>
        </button>
        <DataPathViewer :data="stepper.globals" />
      </div>
    </div>
    <div class="data-container">
      <div class="data-display">
        Table Data <span class="data-label">(.data)</span>
        <button
          @click="stepper.clear()"
          class="button is-small nav-button-small has-tooltip-arrow has-tooltip-bottom"
          data-tooltip="Delete Nodes"
        >
          <span><FAIcon icon="fa-solid fa-trash" /></span>
        </button>
        <DataPathViewer :data="stepper.stepData" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* Important for nested flex containers */
  overflow: hidden;
  background-color: #f1f3f3;
  border-top: 1px solid #cacaca;
}

.tree-viewer-container-empty {
  flex: 1;
  height: 100%;
  padding-top: 15px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 15px;
  font-size: 0.8rem;
  font-family: monospace;
  font-weight: 800;
  color: #3e7974;
  border-top: 1px solid #cacaca;
  background-color: #f1f3f3;
  text-align: left;
}

.path-display-container {
  background-color: #f1f3f3;
  padding: 0px 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  flex-shrink: 0; /* Prevent shrinking */
}

.path-info {
  display: flex;
  align-items: baseline; /* Change from center to baseline */
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 800;
  color: #389e95;
  font-size: 0.9rem;
  line-height: 1; /* Add line-height to control vertical spacing */
}

.path-display {
  margin-left: 5px;
  font-size: clamp(0.5rem, 0.8rem, 0.8rem); /* Shrink font size if needed but not larger than 0.9rem */
  font-family: monospace;
  font-weight: 800;
  color: #246761;
  line-height: 1;
  white-space: nowrap; /* Prevent wrapping */
  overflow: hidden; /* Hide overflow */
  text-overflow: ellipsis; /* Show ellipsis for overflow */
}

.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-button {
  font-size: 0.6rem;
  border-left: 1px solid #e4e4e4;
}
.nav-button-small {
  font-size: 0.5rem;
  border-left: 1px solid #e4e4e4;
}
.smaller {
  padding-bottom: 11px;
  padding-top: 10px;
}
.topbar {
  background-color: #f8f8f8;
  padding-left: 10px;
}
.topbar-border {
  border-top: 1px solid #e4e4e4;
  padding-top: 4px;
}

.index-display {
  font-size: 0.7rem;
  padding-right: 4px;
  padding-top: 3px;
  font-family: monospace;
  font-weight: 800;
  color: #e49310;
  line-height: 1; /* Add line-height to match */
  text-align: right;
  position: absolute;
  right: 0;
  top: 4px;
}
.content-display {
  font-size: 0.7rem;
  line-height: 1.4;
  font-family: monospace;
  font-weight: 800;
  color: #6a6a6a;
  white-space: pre-wrap;
}

.state-tree-viewer {
  font-family: monospace;
  padding: 1rem;
}

.tree-container {
  flex: 0 1 auto; /* don't grow, can shrink, auto basis */
  overflow: auto;
  font-family: monospace;
  border-top: 1px solid #cacaca;
  position: relative;
  scroll-behavior: smooth;
  max-height: 300px;
  min-height: 50px;
  background-color: #fff;
}

.data-container-global {
  flex: 0 0 auto; /* don't grow, don't shrink, auto basis */
  overflow: visible;
  display: flex;
  flex-direction: column;
  max-height: 120px;
  background-color: #f1f3f3;
  border-top: 1px solid #cacaca;
  text-align: left;
}

.data-container {
  flex: 0 0 auto; /* don't grow, don't shrink, auto basis */
  overflow: visible;
  display: flex;
  flex-direction: column;
  background-color: #f1f3f3;
  border-top: 1px solid #cacaca;
  text-align: left;
}

.tree-root {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  font-family: monospace;
}

.tree-node {
  margin: 3px 0;
  position: relative;
  font-family: monospace;
  font-size: 0.75rem;
}

/* First tree node has no padding */
.tree-root > li.tree-node {
  padding-left: 0;
}
.global-data-display {
  flex: 1;
  overflow: auto;
  padding: 10px;
  max-height: 120px;
  min-height: 120px;
  font-size: 0.8rem;
  font-weight: 800;
  font-family: monospace;
  z-index: 2000;
}

.data-display {
  flex: 1;
  overflow: auto;
  padding: 10px;
  min-height: 180px;
  font-size: 0.8rem;
  font-weight: 800;
  font-family: monospace;
}

.data-label {
  font-size: 0.7rem;
  font-weight: 800;
  font-family: monospace;
  color: #10a8a2;
  padding-right: 6px;
}
</style>
