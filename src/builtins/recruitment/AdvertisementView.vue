<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { animate, stagger } from 'motion'
import SplitType from 'split-type'
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

let timer
let timer_text
let clicked = false
const button = ref(null)
const title = ref(null)

function wiggle() {
  if (!clicked) {
    animate(button.value, { rotate: [0, 10, -10, 10, -10, 0] }, { duration: 0.75 }).finished.then(() => {
      timer = setTimeout(wiggle, 15000) // Reinitialize the timer after animation
    })
  }
}

function titleappear() {
  console.log('titleappear')
  animate('.word', { opacity: [0, 1] }, { delay: stagger(0.5) })
}

onMounted(() => {
  const text = new SplitType(title.value, { types: 'words, chars' })
  //console.log(text)
  //timer_text = setTimeout(titleappear, 300)
  timer = setTimeout(wiggle, 3000)
})

function finish() {
  clicked = true
  // if there's anything else you wanted to do here
  // smilestore.saveData()
  api.stepNextRoute()
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

<style>
.word {
  opacity: 1;
}
</style>
