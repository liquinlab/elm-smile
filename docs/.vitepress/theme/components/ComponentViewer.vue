<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    required: true
  },
  component: {
    type: Object,
    required: true
  }
})

const { copied, copy } = useClipboard()
const tabValue = ref('preview')
const resizableRef = ref()
const currentSize = ref(100)

const resizeComponent = (percentage) => {
  currentSize.value = percentage
  if (resizableRef.value) {
    resizableRef.value.style.width = `${percentage}%`
  }
}

const copyCode = () => {
  copy(props.code)
}

onMounted(() => {
  resizableRef.value.style.width = '100%'
})
</script>

<template>
  <div class="component-viewer border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div class="flex items-center gap-4">
        <!-- Tabs -->
        <div class="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-md p-1">
          <button 
            @click="tabValue = 'preview'"
            :class="[
              'px-3 py-1.5 text-sm rounded-sm transition-colors',
              tabValue === 'preview' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
            ]"
          >
            Preview
          </button>
          <button 
            @click="tabValue = 'code'"
            :class="[
              'px-3 py-1.5 text-sm rounded-sm transition-colors',
              tabValue === 'code' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
            ]"
          >
            Code
          </button>
        </div>
        
        <!-- Description -->
        <div v-if="description" class="text-sm text-gray-600 dark:text-gray-400">
          {{ description }}
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2">
        <!-- Responsive controls -->
        <div class="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-md p-1">
          <button
            @click="resizeComponent(100)"
            :class="[
              'p-1.5 rounded-sm transition-colors',
              currentSize === 100 ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            title="Desktop"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="12" rx="2"/>
              <path d="M2 16h20"/>
            </svg>
          </button>
          <button
            @click="resizeComponent(768)"
            :class="[
              'p-1.5 rounded-sm transition-colors',
              currentSize === 768 ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            title="Tablet"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
            </svg>
          </button>
          <button
            @click="resizeComponent(375)"
            :class="[
              'p-1.5 rounded-sm transition-colors',
              currentSize === 375 ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            title="Mobile"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="7" y="1" width="10" height="22" rx="2"/>
            </svg>
          </button>
        </div>

        <!-- Copy button -->
        <button
          @click="copyCode"
          class="p-2 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Copy code"
        >
          <svg v-if="copied" class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-0">
      <!-- Preview -->
      <div v-show="tabValue === 'preview'" class="relative overflow-hidden">
        <div class="bg-gray-50 dark:bg-gray-800 p-8">
          <div 
            ref="resizableRef"
            class="transition-all duration-300 ease-in-out mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
            :style="{ maxWidth: currentSize === 100 ? '100%' : `${currentSize}px` }"
          >
            <component :is="component" />
          </div>
        </div>
      </div>

      <!-- Code -->
      <div v-show="tabValue === 'code'" class="relative">
        <pre class="p-4 text-sm overflow-x-auto bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"><code v-html="code"></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

code {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
}
</style>