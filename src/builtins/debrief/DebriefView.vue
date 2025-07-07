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
  <ConstrainedTaskWindow variant="ghost" class="p-8">
    <div class="w-[80%] h-[80%]">
      <component :is="debriefText" />
      <hr class="border-border my-6" />
      <div class="flex justify-end mt-4">
        <Button variant="default" @click="finish()">
          next
          <FAIcon icon="fa-solid fa-arrow-right" />
        </Button>
      </div>
    </div>
  </ConstrainedTaskWindow>
</template>
