<script setup>
import { onMounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useViewAPI()

function finish() {
  // smilestore.saveData()
  api.goNextView()
}
</script>

<template>
  <div class="page select-none">
    <h1 class="text-2xl font-bold mb-4">Experiment</h1>
    <hr class="border-gray-300 my-4" />
    <div class="flex justify-end">
      <Button variant="default" @click="finish()">
        next
        <FAIcon icon="fa-solid fa-arrow-right" />
      </Button>
    </div>
  </div>
</template>
