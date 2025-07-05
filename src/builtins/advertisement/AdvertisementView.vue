<script setup>
// import Vue functions
import { onMounted, ref, onBeforeUnmount } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// import UIkit components
import { Button } from '@/uikit/components/ui/button'

// animation library
import { animate } from 'motion'

let timer // waits before doing animation
let clicked = false // has the button been clicked?
const button = ref(null) // reference to button

// this function wiggles the button a little if it hasn't been clicked
// just some fun
function wiggle() {
  if (!clicked && button.value) {
    animate(button.value.$el, { rotate: [0, 60, -60, 60, -60, 0] }, { duration: 0.75 }).finished.then(() => {
      timer = setTimeout(wiggle, 15000) // Reinitialize the timer after animation
    })
  }
}

onMounted(() => {
  timer = setTimeout(wiggle, 3000)
})

function finish() {
  clicked = true
  api.preloadAllImages()
  api.preloadAllVideos()
  api.goNextView()
}

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <div class="mt-20 select-none flex flex-col items-center">
    <img ref="logo" src="@/user/assets/brain.svg" width="220" class="brain-logo" />
    <h1 ref="title" class="text-3xl font-bold mb-4">Please help us understand the mind!</h1>
    <p>Take part in a short experiment where you play some games.</p>
    <br />
    <Button ref="button" id="begintask" @click="finish()" size="lg">
      I'm ready!
      <i-lucide-arrow-right />
    </Button>
  </div>
</template>

<style scoped>
.brain-logo {
  filter: invert(0);
}

.dark .brain-logo {
  filter: invert(1);
}
</style>
