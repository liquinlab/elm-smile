<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const emit = defineEmits(['nextPageCaptcha'])

import { animate } from 'motion'

import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const MAX_TIME = 5000
let start_time
let timeout = ref(0)

const handleClick = () => {
  api.log('Button pressed')

  emit('nextPageCaptcha')
}

onMounted(() => {
  start_time = Date.now()
  timeout.value = ((MAX_TIME - (Date.now() - start_time)) / MAX_TIME) * 100

  // Add the infinite animation for the top ellipse
  animate(
    '#top',
    {
      transform: ['translateY(0px)', 'translateY(-10px)', 'translateY(0px)'],
    },
    {
      duration: 1,
      repeat: Infinity,
      easing: 'ease-in-out',
    }
  )
})

const myInterval = setInterval(() => {
  timeout.value = ((MAX_TIME - (Date.now() - start_time)) / MAX_TIME) * 100
  if (timeout.value <= 0) {
    clearInterval(myInterval)
    emit('nextPageCaptcha')
  }
}, 2)

onUnmounted(() => {
  clearInterval(myInterval)
})
</script>

<template>
  <div class="instructions prevent-select">
    <div class="content-container">
      <h1 class="title">Don't press the button!</h1>

      <div class="button-wrapper" @click="handleClick()">
        <svg width="301" height="300" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="500" fill="white" />
          <rect width="500" height="500" fill="#9BD9CE" />
          <ellipse cx="250.5" cy="261" rx="149.5" ry="133" fill="#A4A2A6" />
          <ellipse cx="250.5" cy="242" rx="149.5" ry="133" fill="#BDBBBF" />
          <ellipse cx="250.5" cy="187.5" rx="124.5" ry="106.5" fill="#BF5367" />
          <rect x="126" y="185" width="249" height="65" fill="#BF5367" />
          <ellipse cx="250.5" cy="250.5" rx="124.5" ry="106.5" fill="#BF5367" />
          <ellipse id="top" cx="250.5" cy="187.5" rx="124.5" ry="106.5" fill="#ED6B83" />
        </svg>
      </div>
    </div>
    <br />
    <br />
    Time remaining: <progress class="progress is-large" :value="timeout" max="100"></progress>
  </div>
</template>

<style scoped>
.instructions {
  width: 60%;
  margin: auto;
  text-align: center;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  margin-bottom: 2rem;
}

.button-wrapper {
  margin: 2rem 0;
  height: 302px;
  width: 600px;
  background-color: #9bd9ce;
  border: 1px solid #000000;
}

.continue-button {
  background-color: rgb(239, 68, 68);
  color: white;
  padding: 2rem 4rem;
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition:
    transform 0.1s ease-out,
    background-color 0.2s ease;
}

.continue-button:hover {
  background-color: rgb(220, 38, 38);
}

.continue-button:active {
  transform: scale(0.98);
}

.progress {
  width: 100%;
  height: 1rem;
  border-radius: 9999px;
}
</style>
