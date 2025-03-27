<script setup>
import { computed } from 'vue'

const props = defineProps({
  state: Object,
  index: Number,
  total: Number,
  isNodeSelected: Function,
  formatData: Function,
  depth: {
    type: Number,
    default: 1,
  },
  maxDepth: {
    type: Number,
    default: 5,
  },
  verticalLines: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['node-click'])

const handleClick = () => {
  emit('node-click', props.state.path)
}

const getBranchType = (index, total, depth) => {
  // Only show ┌── for the first item at depth 1
  if (index === 0 && depth === 1) {
    return '┌─ '
  } else if (index === total - 1) {
    return '└─ '
  } else {
    return '├─ '
  }
}

// Create the vertical lines prefix
const getVerticalPrefix = (verticalLines) => {
  if (!verticalLines || !verticalLines.length) return ''

  return verticalLines.map((hasLine) => (hasLine ? '│ ' : '  ')).join('')
}

// Create new vertical lines for children based on current node
const getChildVerticalLines = (verticalLines, index, total) => {
  const newLines = [...verticalLines]

  // Add a line if this is not the last item
  newLines.push(index < total - 1)

  return newLines
}

const isEndState = computed(() => {
  return props.state.path === 'SOS' || props.state.path === 'EOS'
})
</script>

<template>
  <li class="tree-node">
    <div
      class="tree-line"
      :class="{
        'node-selected': isNodeSelected(state.path),
      }"
      @click="handleClick"
    >
      <span class="vertical-lines">{{ getVerticalPrefix(verticalLines) }}</span>
      <span class="tree-branch" :class="{ 'end-state': isEndState }">{{ getBranchType(index, total, depth) }}</span>
      <span class="node-path" :class="{ 'end-state': isEndState, 'leaf-state': !state.isLeaf }"
        >{{ state.path }} <FAIcon icon="fa-solid fa-house-flag" class="home-icon" v-if="state.isFirstLeaf" />
        <FAIcon icon="fa-solid fa-leaf" class="leaf-icon" v-else-if="state.isLeaf && !isEndState" />
        <FAIcon icon="fa-solid fa-ban" v-if="isEndState"
      /></span>
    </div>

    <!-- Recursive tree nodes, but limit depth -->
    <ul v-if="state.rows && state.rows.length > 0 && depth < maxDepth" class="children">
      <TreeNode
        v-for="(childState, childIndex) in state.rows"
        :key="childIndex"
        :state="childState"
        :index="childIndex"
        :total="state.rows.length"
        :is-node-selected="isNodeSelected"
        :format-data="formatData"
        :depth="depth + 1"
        :max-depth="maxDepth"
        :vertical-lines="getChildVerticalLines(verticalLines, index, total)"
        @node-click="$emit('node-click', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.tree-node {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-line {
  display: flex;
  align-items: center;
  padding: 2px 0;
  white-space: pre;
  cursor: pointer;
  margin-right: 10px;
  margin-left: 10px;
}

.tree-line:hover {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
}

.node-selected {
  background-color: rgb(146, 249, 224);
  color: black;
  border-radius: 10px;
}

.vertical-lines {
  font-family: monospace;
}

.tree-branch {
  font-family: monospace;
}

.node-path {
  margin-left: 4px;
  font-weight: 600;
}

.node-data {
  margin-left: 8px;
  color: #666;
  font-family: monospace;
}

.children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.end-state {
  opacity: 0.4;
  color: #f10e0e;
}

.leaf-state {
  opacity: 0.5;
}

.leaf-icon {
  color: #04a004;
  opacity: 0.35;
}

.home-icon {
  color: #0eb6e0;
  opacity: 0.65;
}
</style>
