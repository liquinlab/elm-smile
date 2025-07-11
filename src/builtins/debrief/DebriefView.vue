<script setup>
//import DebriefText from '@/user/components/DebriefText.vue' // get access to the global store
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { ConstrainedTaskWindow } from '@/uikit/layouts'
const api = useViewAPI()

const props = defineProps({
  debriefText: {
    type: Object,
    required: true,
  },
})

function finish() {
  // do stuff if you want
  api.goNextView()
}
</script>

<template>
  <ConstrainedTaskWindow
    variant="ghost"
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
    class="p-8"
  >
    <div class="w-[80%] h-[80%]">
      <component :is="debriefText" />
      <hr class="border-border my-6" />
      <div class="flex justify-end mt-4">
        <Button variant="default" @click="finish()">
          next
          <i-fa6-solid-arrow-right />
        </Button>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
