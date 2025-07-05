<script setup>
import { ref, h, defineComponent, computed } from 'vue'

// Simulate the TwoCol component from the uikit
const TwoCol = defineComponent({
  name: 'TwoCol',
  props: {
    leftFirst: Boolean,
    leftWidth: {
      type: String,
      default: 'w-1/3'
    }
  },
  setup(props, { slots }) {
    const getResponsiveWidthClasses = (leftWidth) => {
      const widthMap = {
        'w-1/12': 'w-full lg:w-1/12',
        'w-1/6': 'w-full lg:w-1/6', 
        'w-1/4': 'w-full lg:w-1/4',
        'w-1/3': 'w-full lg:w-1/3',
        'w-2/5': 'w-full lg:w-2/5',
        'w-1/2': 'w-full lg:w-1/2',
        'w-3/5': 'w-full lg:w-3/5',
        'w-2/3': 'w-full lg:w-2/3',
        'w-3/4': 'w-full lg:w-3/4',
        'w-4/5': 'w-full lg:w-4/5',
        'w-5/6': 'w-full lg:w-5/6',
        'w-11/12': 'w-full lg:w-11/12',
      }
      return widthMap[leftWidth] || 'w-full lg:w-1/3'
    }

    const leftColumnClasses = computed(() => getResponsiveWidthClasses(props.leftWidth))
    
    return () => h('div', {
      class: 'w-full select-none mx-auto text-left my-10'
    }, [
      h('div', {
        class: ['flex gap-6', props.leftFirst ? 'flex-col lg:flex-row' : 'flex-col-reverse lg:flex-row']
      }, [
        h('div', {
          class: leftColumnClasses.value
        }, slots.left?.()),
        h('div', {
          class: 'flex-1'
        }, slots.right?.())
      ])
    ])
  }
})

const leftWidth = ref('w-1/3')
</script>

<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex gap-2 flex-wrap">
      <label class="text-sm font-medium">Left Width:</label>
      <select v-model="leftWidth" class="px-2 py-1 border rounded text-sm">
        <option value="w-1/4">w-1/4 (25%)</option>
        <option value="w-1/3">w-1/3 (33%)</option>
        <option value="w-2/5">w-2/5 (40%)</option>
        <option value="w-1/2">w-1/2 (50%)</option>
        <option value="w-3/5">w-3/5 (60%)</option>
        <option value="w-2/3">w-2/3 (67%)</option>
      </select>
    </div>

    <!-- Example -->
    <TwoCol :left-width="leftWidth" left-first>
      <template #left>
        <div class="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Left Column</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            This column's width is controlled by the <code>leftWidth</code> prop. 
            Try resizing the browser or changing the width setting above.
          </p>
        </div>
      </template>
      <template #right>
        <div class="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Right Column</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            This column automatically takes up the remaining space using <code>flex-1</code>.
            It will stack below the left column on mobile devices.
          </p>
          <div class="mt-3 space-y-2">
            <div class="bg-white dark:bg-gray-800 p-2 rounded text-xs">Content item 1</div>
            <div class="bg-white dark:bg-gray-800 p-2 rounded text-xs">Content item 2</div>
            <div class="bg-white dark:bg-gray-800 p-2 rounded text-xs">Content item 3</div>
          </div>
        </div>
      </template>
    </TwoCol>
  </div>
</template>