<script setup>
import { computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'
const api = useViewAPI()

const cond = api.getConditionByName('instructionsVersion')

// computed property based on condition in data
const instText = computed(() => {
  // how do you know that instructions will exist because it
  // starts off empty?
  if (cond === '1') {
    return 'instructions version 1'
  }
  if (cond === '2') {
    return 'instructions version 2'
  }
  if (cond === '3') {
    return 'instructions version 3'
  }
  return 'no condition set'
})

function finish(goto) {
  api.goNextView()
}
</script>

<template>
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <div class="w-[80%] h-[80%]">
      <h1 class="text-2xl font-bold mb-4">
        <i-material-symbols-integration-instructions class="inline-block mr-2 text-3xl" /> Instructions
      </h1>
      <p class="text-left text-lg mb-4">{{ instText }}</p>
      <hr class="border-gray-300 my-4" />
      <div class="flex justify-end">
        <Button variant="default" @click="finish()">
          next
          <i-fa6-solid-arrow-right />
        </Button>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
