<script setup>
// import Vue functions
import { onMounted, ref, onBeforeUnmount } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// animation library
import { animate } from 'motion'

let timer // waits before doing animation
let clicked = false // has the button been clicked?
const button = ref(null) // reference to button

// this function wiggles the button a little if it hasn't been clicked
// just some fun
function wiggle() {
  if (!clicked) {
    animate(button.value, { rotate: [0, 10, -10, 10, -10, 0] }, { duration: 0.75 }).finished.then(() => {
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
  <div class="page prevent-select">
    <br /><br /><br />
    <img ref="logo" src="@/user/assets/brain.svg" width="220" />
    <h1 ref="title" class="title is-3">Please help us understand the mind!</h1>
    <p>Take part in a short experiment where you play some games.</p>
    <br />
    <button ref="button" class="button is-warning" id="begintask" @click="finish()">
      I'm ready! &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
