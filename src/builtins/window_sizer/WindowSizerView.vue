<script setup>
import { reactive, onMounted } from 'vue'
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { CenteredContent } from '@/uikit/layouts'
const api = useViewAPI()
const props = defineProps(['triggered'])

function finish() {
  // smilestore.setConsented()
  // smilestore.saveData()
  api.verifyVisibility(true)
  api.goNextView()
}
</script>

<template>
  <CenteredContent class="m-2 mt-5">
    <div
      class="bg-cyan-100 border-animation flex items-center justify-center"
      :style="{
        width: api.config.windowsizerRequest.width + 'px',
        height: api.config.windowsizerRequest.height + 'px',
        minWidth: api.config.windowsizerRequest.width + 'px',
        minHeight: api.config.windowsizerRequest.height + 'px',
      }"
    >
      <div class="w-2/3 pt-8 mx-auto text-center" v-if="!props.triggered">
        <span class="text-4xl text-blue-900 mb-4 block">
          <FAIcon icon="fa-solid fa-arrows-up-down-left-right"></FAIcon>
        </span>
        <h1 class="text-xl font-semibold text-blue-900 mb-4">
          Please adjust the size of your browser window until <b>ALL</b> four edges of this box are visible.
        </h1>
        <hr class="border-blue-900 my-4" />
        <div class="text-sm text-left mb-4 text-blue-900">
          <b>Warning</b>: If you can't resize your window and see the entire box please click the red "withdraw" button
          at the top of the page and return the task. You need to be able view the entire page at once.
        </div>
        <hr class="border-blue-900 my-4" />
        <div class="mt-8">
          <Button variant="info" size="lg" @click="finish()">
            It is visible now, I'm ready
            <FAIcon icon="fa-solid fa-arrow-right" />
          </Button>
        </div>
      </div>
      <div class="w-2/3 pt-8 mx-auto text-center" v-else>
        <span class="text-4xl text-blue-900 mb-4 block">
          <FAIcon icon="fa-solid fa-arrows-up-down-left-right"></FAIcon>
        </span>
        <h1 class="text-xl font-semibold text-blue-900 mb-4">
          <b>We don't want you to miss anything!</b><br />Please re-adjust the size of your browser window until
          <b>ALL</b> four edges of this box are visible.
        </h1>
        <hr class="border-blue-900 my-4" />
        <div class="text-sm text-left text-blue-700">
          <b>Warning</b>: If you can't resize your window and see the entire box please click the red "withdraw" button
          at the top of the page and return the task. You need to be able view the entire page at once.
        </div>
      </div>
    </div>
  </CenteredContent>
</template>

<style scoped>
.border-animation {
  background-image:
    linear-gradient(90deg, rgb(18, 53, 90) 50%, transparent 50%),
    linear-gradient(90deg, rgb(18, 53, 90) 50%, transparent 50%),
    linear-gradient(0deg, rgb(18, 53, 90) 50%, transparent 50%),
    linear-gradient(0deg, rgb(18, 53, 90) 50%, transparent 50%);
  background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
  background-size:
    15px 2px,
    15px 2px,
    2px 15px,
    2px 15px;
  background-position:
    left top,
    right bottom,
    left bottom,
    right top;
  animation: border-dance 0.5s infinite linear;
}

@keyframes border-dance {
  0% {
    background-position:
      left top,
      right bottom,
      left bottom,
      right top;
  }

  100% {
    background-position:
      left 15px top,
      right 15px bottom,
      left bottom 15px,
      right top 15px;
  }
}
</style>
