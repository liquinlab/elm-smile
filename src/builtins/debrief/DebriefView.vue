<script setup>
//import DebriefText from '@/user/components/DebriefText.vue' // get access to the global store
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
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
  <div class="page prevent-select">
    <component :is="debriefText" />
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
