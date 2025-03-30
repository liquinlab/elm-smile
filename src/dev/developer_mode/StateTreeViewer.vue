<script setup>
import { ref, computed, watch, onMounted, defineComponent, h } from 'vue'
import TreeNode from './TreeNode.vue'
import DataPathViewer from '@/dev/developer_mode/DataPathViewer.vue'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useSmileStore()

// Reactively get the stepper for the current page
const stepper = computed(() => {
  return store.global.steppers?.[route.name]
})

// Add a watcher to handle stepper initialization
watch(
  () => store.global.steppers?.[route.name],
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
    stepper.value.goTo(path)
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
      // First try the new ScrollIntoViewOptions
      selectedNode.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    } catch (e) {
      // Fallback for older browsers or if the above fails
      const containerRect = treeContainer.value.getBoundingClientRect()
      const nodeRect = selectedNode.getBoundingClientRect()
      const scrollOffset = nodeRect.top - containerRect.top - containerRect.height / 2 + nodeRect.height / 2

      treeContainer.value.scrollTop += scrollOffset
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
  <div v-if="!stepper">No stepper found</div>
  <div class="tree-viewer-container" v-else>
    <div class="path-display-container">
      <div class="path-info">
        <span class="index-display">{{ stepper.index }}</span>
        <span class="path-display">{{ stepper.paths }}</span>
        &nbsp;<FAIcon icon="fa-solid fa-ban" v-if="isEndState" />
      </div>

      <div class="field has-addons">
        <p class="control">
          <button @click="stepper.reset()" class="button is-small nav-button">
            <span><FAIcon icon="fa-solid fa-house-flag" /></span>
          </button>
        </p>
        <p class="control">
          <button @click="stepper.clearState()" class="button is-small nav-button">
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

    <div class="data-container">
      <div class="data-display">
        Node Data
        <DataPathViewer :data="stepper.datapath" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-viewer-container {
  text-align: left;
  width: 100%;
  height: 100%;
  margin: 0 0;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0px;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for nested flex containers */
}

.path-display-container {
  background-color: #f1f3f3;
  padding: 20px 15px;
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
  font-size: 1.2rem;
  font-family: monospace;
  font-weight: 800;
  color: #246761;
  line-height: 1; /* Add line-height to match */
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
  font-size: 0.8rem;
  font-family: monospace;
  font-weight: 800;
  color: #3e7974;
  line-height: 1; /* Add line-height to match */
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
  height: 500px;
  overflow: auto;
  font-family: monospace;
  flex-shrink: 0;
  border-top: 1px solid #cacaca;
  position: relative;
  scroll-behavior: smooth;
  height: auto;
  max-height: 500px;
  flex: 1;
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
}

/* First tree node has no padding */
.tree-root > li.tree-node {
  padding-left: 0;
}

.data-container {
  flex: 1 1 auto; /* grow, shrink, auto basis */
  overflow: auto;
  padding-left: 0px;
  margin-left: 0px;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for nested flex containers */
  background-color: #f1f3f3;
  border-top: 1px solid #cacaca;
}

.data-display {
  flex: 1;
  overflow: auto;
  padding: 10px;
  font-size: 0.8rem;
  font-weight: 800;
  font-family: monospace;
}
</style>
