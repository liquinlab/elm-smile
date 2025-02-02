<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useMouse } from '@vueuse/core'
const emit = defineEmits(['nextPageCaptcha'])
import { animate } from 'motion'

import useAPI from '@/core/composables/useAPI'
import { Circle } from '@svgdotjs/svg.js'
const api = useAPI()

const MAX_TIME = 15000
let start_time
let timeout = ref(0)
const begin = ref(false)

// Use VueUse mouse composable for position
const { x, y } = useMouse()

// Generate random image filename
function getRandomImageFile() {
  const index = String(Math.floor(Math.random() * 20)).padStart(3, '0')
  const rotation = String(Math.floor(Math.random() * 24) * 15).padStart(3, '0')
  return `${index}_${rotation}.jpg`
}

const imageFile = ref(null)
const imageRef = ref(null)
const containerRef = ref(null)
let currentRotation = ref(0)

// Watch for mouse position changes and update rotation
watch(x, (newX) => {
  if (!containerRef.value || !imageRef.value) return

  // Get the center of the image
  const rect = containerRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2

  // Calculate rotation based on mouse position relative to center
  const scaleFactor = 1.0
  const rotationDegrees = (newX - centerX) * scaleFactor

  currentRotation.value = rotationDegrees
  imageRef.value.style.transform = `rotate(${rotationDegrees}deg)`
})

// Handle clicks directly through window event
const handleClick = (e) => {
  console.log('clicked', y.value)

  if (y.value < 30) return

  api.log(`Final rotation: ${currentRotation.value}`)
  emit('nextPageCaptcha')
}

function beingTask() {
  // Add click handler
  window.addEventListener('mousedown', handleClick)
  console.log('randomizing image')
  imageFile.value = getRandomImageFile()
  start_time = Date.now()
  timeout.value = ((MAX_TIME - (Date.now() - start_time)) / MAX_TIME) * 100
  begin.value = true
}

onMounted(() => {
  // Add pulsing animation to the circle
  const circle = document.querySelector('#circle')
  animate(
    circle,
    { r: [25, 50, 25], opacity: [1, 0.5, 1] },
    {
      duration: 1.8,
      easing: 'ease-in-out',
      repeat: Infinity,
    }
  )
})

onUnmounted(() => {
  console.log('unmounting')
  // Clean up click handler
  window.removeEventListener('mousedown', handleClick)
})

const myInterval = setInterval(() => {
  timeout.value = ((MAX_TIME - (Date.now() - start_time)) / MAX_TIME) * 100
  if (timeout.value <= 0) {
    clearInterval(myInterval)
    emit('nextPageCaptcha')
  }
}, 2)
</script>

<template>
  <div class="instructions prevent-select">
    <div ref="containerRef" class="image-container" v-if="!begin">
      <h1 class="title">
        <div class="first">Click me, you know you want to!</div>
        <div class="second">Come on, do it!</div>
        <div class="second">Try to click it, I dare you.</div>
      </h1>

      <div class="image-wrapper">
        <svg width="300" height="500">
          <circle
            id="circle"
            :cx="150"
            :cy="150"
            :r="Math.random() * 20 + 50"
            :stroke-width="5"
            stroke="#ED6B83"
            fill="#F2BBBB"
            @click="beingTask()"
          />
        </svg>
      </div>
    </div>
    <div ref="containerRef" class="image-container" v-else>
      <h1 class="title">Quickly rotate the object into place!</h1>
      <p class="is-size-5">Move your mouse left or right to rotate. Click anywhere when it looks correct!</p>

      <div class="image-wrapper">
        <img
          ref="imageRef"
          :src="`src/assets/captcha/rotate/${imageFile}`"
          class="circular-image"
          alt="Circular Image"
        />
      </div>
      <br />
      <br />
      Respond quickly: <progress class="progress is-large" :value="timeout" max="100"></progress>
    </div>
  </div>
</template>

<style scoped>
.instructions {
  width: 60%;
  margin: auto;
}

.instructions p {
  padding-bottom: 20px;
}

.image-container {
  margin: 0 auto;
  cursor: pointer;
}

.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.circular-image {
  width: 350px;
  border-radius: 50%;
  overflow: hidden;
  object-fit: cover;
  transition: transform 0.1s ease-out;
}
</style>
