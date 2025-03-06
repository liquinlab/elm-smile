<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const emit = defineEmits(['nextPageCaptcha'])

import { animate } from 'motion'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const MAX_TIME = 5000
let start_time
let timeout = ref(0)

const dotPosition = ref({ x: 250, y: 250 })
const lastMousePosition = ref({ x: 0, y: 0 })
const lastMouseTime = ref(Date.now())
const containerRef = ref(null)

const handleMouseMove = (event) => {
  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  // Calculate distance from mouse to edges
  const mouseEdgeDist = Math.min(mouseX, mouseY, 500 - mouseX, 500 - mouseY)

  // Calculate dot's distance from center
  const centerX = 250
  const centerY = 250
  const distFromCenter = Math.sqrt(
    Math.pow(dotPosition.value.x - centerX, 2) + Math.pow(dotPosition.value.y - centerY, 2)
  )

  // Calculate mouse speed with smoothing
  const currentTime = Date.now()
  const timeDiff = Math.max(currentTime - lastMouseTime.value, 16) // Cap at 60fps
  const mouseDist = Math.sqrt(
    Math.pow(mouseX - lastMousePosition.value.x, 2) + Math.pow(mouseY - lastMousePosition.value.y, 2)
  )
  const mouseSpeed = mouseDist / timeDiff

  // Calculate distance to dot
  const distToDot = Math.sqrt(Math.pow(mouseX - dotPosition.value.x, 2) + Math.pow(mouseY - dotPosition.value.y, 2))

  // Move dot based on mouse movement and position
  let newX = dotPosition.value.x
  let newY = dotPosition.value.y

  // Apply center attraction when mouse is near edges
  const edgeThreshold = 100
  const centeringForce = Math.max(0, 1 - mouseEdgeDist / edgeThreshold) * 0.1

  if (distFromCenter > 50) {
    const centerAngle = Math.atan2(centerY - dotPosition.value.y, centerX - dotPosition.value.x)
    newX += Math.cos(centerAngle) * centeringForce * distFromCenter
    newY += Math.sin(centerAngle) * centeringForce * distFromCenter
  }

  // Apply mouse avoidance if mouse is moving fast and close
  if (mouseSpeed > 0.2 && distToDot < 200) {
    // Calculate angle from mouse to dot
    const angle = Math.atan2(dotPosition.value.y - mouseY, dotPosition.value.x - mouseX)

    // Move dot away from mouse with smooth acceleration
    const moveDistance = Math.min(40, (200 / distToDot) * 15)

    // Calculate new position
    let newX = dotPosition.value.x + Math.cos(angle) * moveDistance
    let newY = dotPosition.value.y + Math.sin(angle) * moveDistance

    // Add boundary repulsion
    const margin = 50
    const repulsionStrength = 0.8

    // Repel from left/right boundaries
    if (newX < margin) {
      newX += (margin - newX) * repulsionStrength
    } else if (newX > 500 - margin) {
      newX -= (newX - (500 - margin)) * repulsionStrength
    }

    // Repel from top/bottom boundaries
    if (newY < margin) {
      newY += (margin - newY) * repulsionStrength
    } else if (newY > 500 - margin) {
      newY -= (newY - (500 - margin)) * repulsionStrength
    }

    // Apply smoothing to combined movement
    const smoothing = 0.3
    dotPosition.value = {
      x: dotPosition.value.x + (newX - dotPosition.value.x) * smoothing,
      y: dotPosition.value.y + (newY - dotPosition.value.y) * smoothing,
    }
  }

  // Always apply a minimal center attraction when dot is far from center
  else if (distFromCenter > 150) {
    const centerAngle = Math.atan2(centerY - dotPosition.value.y, centerX - dotPosition.value.x)
    const minCenteringForce = 0.05
    dotPosition.value = {
      x: dotPosition.value.x + Math.cos(centerAngle) * minCenteringForce * distFromCenter * smoothing,
      y: dotPosition.value.y + Math.sin(centerAngle) * minCenteringForce * distFromCenter * smoothing,
    }
  }

  // Update last mouse position and time
  lastMousePosition.value = { x: mouseX, y: mouseY }
  lastMouseTime.value = currentTime
}

const handleClick = () => {
  api.log('Dot caught')
  emit('nextPageCaptcha')
}

onMounted(() => {
  start_time = Date.now()
  timeout.value = ((MAX_TIME - (Date.now() - start_time)) / MAX_TIME) * 100
})

const myInterval = setInterval(() => {
  timeout.value = ((MAX_TIME - (Date.now() - start_time)) / MAX_TIME) * 100
  if (timeout.value <= 0) {
    clearInterval(myInterval)
    //emit('nextPageCaptcha')
  }
}, 2)

onUnmounted(() => {
  clearInterval(myInterval)
})
</script>

<template>
  <div class="instructions prevent-select">
    <div class="content-container">
      <h1 class="title">Catch the dot!</h1>

      <div class="button-wrapper" ref="containerRef" @mousemove="handleMouseMove">
        <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="500" fill="#9BD9CE" />
          <circle
            :cx="dotPosition.x"
            :cy="dotPosition.y"
            r="20"
            fill="#ED6B83"
            @click="handleClick"
            style="cursor: pointer"
          />
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
  height: 502px;
  width: 500px;
  background-color: #9bd9ce;
  border: 1px solid #000000;
}

.progress {
  width: 100%;
  height: 1rem;
  border-radius: 9999px;
}
</style>
