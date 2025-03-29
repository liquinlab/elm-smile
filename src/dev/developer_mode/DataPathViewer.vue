<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: [Object, Array, String, Number, Boolean],
    required: true,
  },
})

const expandedNodes = ref(new Set())

const toggleNode = (path) => {
  if (expandedNodes.value.has(path)) {
    expandedNodes.value.delete(path)
  } else {
    expandedNodes.value.add(path)
  }
}

const formatValue = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

const isExpandable = (value) => {
  return value !== null && (typeof value === 'object' || Array.isArray(value))
}
</script>

<template>
  <div class="data-path-viewer">
    <template v-if="isExpandable(data)">
      <div v-for="(value, key) in data" :key="key" class="data-node">
        <div class="node-content" @click="toggleNode(key)">
          <span class="expand-icon">{{ expandedNodes.has(key) ? '▼' : '▶' }}</span>
          <span class="key">{{ key }}:</span>
          <span v-if="!expandedNodes.has(key)" class="preview">
            {{ Array.isArray(value) ? `[${value.length} items]` : '{...}' }}
          </span>
        </div>
        <div v-if="expandedNodes.has(key)" class="nested-content">
          <DataPathViewer :data="value" />
        </div>
      </div>
    </template>
    <template v-else>
      <span class="primitive-value">{{ formatValue(data) }}</span>
    </template>
  </div>
</template>

<style scoped>
.data-path-viewer {
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.4;
}

.data-node {
  margin: 2px 0;
}

.node-content {
  cursor: pointer;
  padding: 2px 0;
  user-select: none;
}

.node-content:hover {
  background-color: #f0f0f0;
}

.expand-icon {
  display: inline-block;
  width: 16px;
  color: #666;
}

.key {
  color: #881391;
  margin-right: 4px;
}

.preview {
  color: #666;
  font-style: italic;
}

.primitive-value {
  color: #1a1aa6;
}

.nested-content {
  padding-left: 20px;
  border-left: 1px dotted #ccc;
}
</style>
