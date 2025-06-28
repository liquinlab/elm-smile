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
  <aside class="w-full h-full flex flex-col config-list-container" style="background-color: var(--background)">
    <!-- Header -->
    <div v-if="header" class="bg-muted text-dev-text px-3 py-2 text-xs font-medium border-b border-dev-lines">
      <template v-if="header == '/'">
        <FAIcon icon="fa-solid fa-home" class="mr-1" />
      </template>
      <template v-else
        ><span class="font-mono">{{ header }}</span></template
      >
    </div>

    <!-- Menu List -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden" :style="{ height: height_pct }">
      <ul class="space-y-0.5 p-1">
        <!-- Empty state -->
        <li
          v-if="
            (data_field === null || data_field === undefined || Object.keys(data_field).length == 0) && header !== null
          "
        >
          <div class="px-2 py-1.5 text-foreground text-xs font-mono">Empty currently</div>
        </li>

        <!-- Data items -->
        <li v-for="(option, key) in data_field" :key="key">
          <!-- Non-object values (display only) -->
          <div
            v-if="option === null || (typeof option != 'object' && !Array.isArray(option))"
            class="px-2 py-1.5 text-xs font-mono primitive-item"
          >
            <span class="font-mono font-semibold text-foreground item-key">{{ truncateText(key) }}</span>
            <span class="text-foreground item-value"
              >: {{ option === null ? 'null' : truncateText(String(option)) }}</span
            >
          </div>

          <!-- Object values (clickable) -->
          <button
            v-else
            @click="option_selected(key)"
            :class="[
              'w-full text-left px-2 py-1.5 text-xs font-mono rounded transition-colors duration-150 object-item',
              'hover:bg-ring hover:text-blue-700',
              'focus:outline-none focus:ring-1 focus:ring-blue-300 focus:bg-blue-50',
              key === props.selected ? 'bg-blue-100 text-blue-800 border border-muted' : 'text-gray-700',
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="font-semibold text-foreground item-key">{{ truncateText(key) }}</span>
              <FAIcon icon="fa-solid fa-angle-right" class="text-gray-400 text-xs" />
            </div>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
/* Custom scrollbar styling for better UX */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Semantic styling for config list items */
.item-key {
  color: #0baac3; /* Blue for keys */
  font-weight: 400; /* Remove semibold */
}

.primitive-item .item-value {
  color: #dda814; /* Orange for primitive values */
  font-weight: 400; /* Remove semibold */
}

.object-item .item-key {
  color: #0baac3; /* Blue for keys in clickable objects */
  font-weight: 400; /* Remove semibold */
}

.object-item .item-value {
  color: #0baac3; /* Blue for clickable object values */
  font-weight: 400; /* Remove semibold */
}

/* Selected state styling */
.config-list-container .bg-blue-100 {
  background-color: var(--accent);
}

.config-list-container .text-blue-800 {
  color: var(--accent-foreground);
}

.config-list-container .border-blue-200 {
  border-color: var(--accent);
}
</style>
