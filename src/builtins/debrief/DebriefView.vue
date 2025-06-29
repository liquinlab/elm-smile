<script setup>
//import DebriefText from '@/user/components/DebriefText.vue' // get access to the global store
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
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
  <div class="w-3/5 py-10 mx-auto select-none">
    <component :is="debriefText" />
    <hr class="border-border my-6" />
    <div class="flex justify-end mt-4">
      <Button variant="default" @click="finish()">
        next
        <FAIcon icon="fa-solid fa-arrow-right" />
      </Button>
    </div>
  </div>
</template>
