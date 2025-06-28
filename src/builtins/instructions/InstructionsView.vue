<script setup>
import { computed } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
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
  <div class="page select-none">
    <h1 class="text-2xl font-bold mb-4">Instructions</h1>
    <p class="text-center text-lg mb-4">{{ instText }}</p>
    <hr class="border-gray-300 my-4" />
    <div class="flex justify-end">
      <Button variant="default" @click="finish()">
        next
        <FAIcon icon="fa-solid fa-arrow-right" />
      </Button>
    </div>
  </div>
</template>
