<script setup>
import { onMounted } from 'vue'
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'
const api = useViewAPI()

function finish() {
  // smilestore.saveData()
  api.goNextView()
}
</script>

<template>
  <ConstrainedTaskWindow
    variant="ghost"
    class="p-8"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <div class="w-[80%] h-[80%]">
      <h1 class="text-2xl font-bold mb-4">Experiment</h1>
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
