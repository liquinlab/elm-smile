<script setup>
// vue imports
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useMouse } from '@vueuse/core'

// smile imports
import CaptchaTextWhisper from '@/builtins/captcha/CaptchaTextWhisper.vue'
import { animate } from 'motion'

// smile api
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// define event to end this game
const emit = defineEmits(['nextPageCaptcha'])

// input props/parameters for this task
const props = defineProps({
  timed_task: {
    type: Boolean,
    default: false,
  },
  max_time: {
    type: Number,
    default: 15000,
  },
  sample_rate: {
    type: Number,
    default: 50,
  },
})

// constants and refs
const begin = ref(false)
let timeout = ref(0)
let start_time = ref(0)
let myInterval
let rotationInterval

// data objects to store aspects of the task
const data = {
  type: 'CAPTCHA_TRIAL_ROTATE_IMAGE',
  image_file: null,
  rotation_stream: [],
  final_rotation: null,
  response_time: null,
}

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
  if (y.value < 30) return
  if (rotationInterval) {
    clearInterval(rotationInterval)
  }
  // Record final values when user clicks
  data.response_time = Date.now() - start_time.value
  data.final_rotation = currentRotation.value
  api.log.log(`Final rotation: ${currentRotation.value}`)
  // Save trial data before emitting
  api.recordData(data)
  emit('nextPageCaptcha')
}

function beginTask() {
  // Reset rotation stream and response time
  data.rotation_stream = []
  data.response_time = null
  data.final_rotation = null

  // Start recording rotations
  if (props.sample_rate) {
    rotationInterval = setInterval(() => {
      data.rotation_stream.push(currentRotation.value)
    }, props.sample_rate)
  }

  // Add click handler
  window.addEventListener('mousedown', handleClick)
  console.log('randomizing image')
  imageFile.value = getRandomImageFile()
  data.image_file = imageFile.value
  start_time.value = Date.now()
  begin.value = true
  timeout.value = ((props.max_time - (Date.now() - start_time.value)) / props.max_time) * 100
  if (props.timed_task) {
    myInterval = setInterval(() => {
      timeout.value = ((props.max_time - (Date.now() - start_time.value)) / props.max_time) * 100
      if (timeout.value <= 0) {
        clearInterval(myInterval)
        if (rotationInterval) {
          clearInterval(rotationInterval)
        }
        // Record final values when timer completes
        data.response_time = props.max_time
        data.final_rotation = currentRotation.value
        // Save trial data before emitting
        api.recordData(data)
        emit('nextPageCaptcha')
      }
    }, 2)
  }
}

onMounted(() => {
  // Add pulsing animation to the circle
  const circle = document.querySelector('#circle')
  animate(
    circle,
    { r: [15, 30, 15], opacity: [0.3, 1, 0.3] },
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

  if (myInterval) {
    clearInterval(myInterval)
  }

  if (rotationInterval) {
    clearInterval(rotationInterval)
  }
})
</script>

<template>
  <div class="instructions prevent-select">
    <div ref="containerRef" class="image-container" v-if="!begin">
      <div class="is-size-1 has-text-weight-bold">
        <br /><br />
        <CaptchaTextWhisper
          :word-delay="300"
          :fade-delay="1200"
          :word-duration="700"
          :start-delay="2000"
          :sentence-delay="3000"
        >
          <div>Click me.</div>
          <div>Right there.</div>
          <div>Try it.</div>
          <div>You know you want to.</div>
          <div>Hey, help me out here.</div>
        </CaptchaTextWhisper>
      </div>

      <div class="image-wrapper">
        <svg width="300" height="300">
          <circle
            id="circle"
            :cx="150"
            :cy="50"
            :r="Math.random() * 20 + 50"
            :stroke-width="5"
            stroke="#ED6B83"
            fill="#F2BBBB"
            @click="beginTask()"
          />
        </svg>
      </div>
    </div>
    <div ref="containerRef" class="image-container" v-else>
      <h1 class="is-size-1 has-text-weight-bold">Make it look right!</h1>
      <p class="is-size-5">Move your mouse. Click when it looks good.</p>

      <div class="image-wrapper">
        <img
          ref="imageRef"
          :src="`src/assets/captcha/rotate/${imageFile}`"
          class="circular-image"
          alt="Circular Image"
        />
      </div>
      <div v-if="props.timed_task" class="pt-5">
        Respond quickly: <progress class="progress is-large" :value="timeout" max="100"></progress>
      </div>
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

/* Add hover styles for the circle */
#circle:hover {
  stroke: #2ecc71; /* bright green stroke */
  fill: #27ae60; /* darker green fill */
}
</style>
