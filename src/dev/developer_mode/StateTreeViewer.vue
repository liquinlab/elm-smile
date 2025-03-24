<script setup>
import { ref, computed, watch, onMounted, defineComponent, h } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  stateMachine: {
    type: Object,
    required: true,
  },
  path: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['node-click'])

// Add a watch to debug path changes
watch(
  () => props.path,
  (newPath) => {
    console.log('Path changed:', newPath)
  }
)

// Convert array path to string format (e.g., [1, 1] -> "1-1")
const pathToString = (pathArray) => {
  return Array.isArray(pathArray) ? pathArray.join('-') : ''
}

// Add computed property to check if a node is selected
const isNodeSelected = (nodePath) => {
  const currentPathStr = pathToString(props.path)
  //console.log('Comparing paths:', { nodePath, currentPath: currentPathStr })
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
  return formatObjectWithIndent(props.stateMachine)
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
  emit('node-click', path)
}
</script>

<template>
  <div class="tree-viewer-container">
    <div class="tree-container">
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
  </div>
</template>

<style>
.tree-viewer-container {
  text-align: left;
  width: 400px;
  margin: 0 auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.state-tree-viewer {
  font-family: monospace;
  padding: 1rem;
}

.tree-container {
  max-height: 500px;
  overflow: auto;
  font-family: monospace;
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
</style>
