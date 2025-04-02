<script setup>
import { ref, onMounted } from 'vue'
const emit = defineEmits(['nextPageCaptcha'])

import useAPI from '@/core/composables/useAPI'
const api = useAPI()

let MAX_TIME = 15000
let start_time
let timeout = ref(0)

const imageURL = ref('cup.jpg') // Image Refs remains confusing -- need to sort this out
const imageRef = ref()
let initRotation = getRandomRotation() // chose this randomly

function getRandomRotation() {
  // Generate a random number between -9 and 9
  const randomNum = Math.floor(Math.random() * 19) - 9
  // Multiply the random number by 10 to get increments of 10
  return randomNum * 10
}

const rotateImage = (rotationAmount) => {
  //const rotationAmount = direction === 'left' ? -90 : 90
  if (imageRef.value) {
    imageRef.value.style.transform = `rotate(${rotationAmount}deg)`
  }
}

const rotateImageDelta = (rotationAmount) => {
  //const rotationAmount = direction === 'left' ? -90 : 90
  if (imageRef.value) {
    initRotation += rotationAmount
    api.log.log(`${initRotation}`)
    imageRef.value.style.transform = `rotate(${initRotation}deg)`
  }
}

onMounted(() => {
  rotateImage(initRotation)
  start_time = Date.now()
  timeout.value = ((MAX_TIME - (Date.now(0) - start_time)) / MAX_TIME) * 100
  api.log.log(`${timeout}`)
})

var myInterval = setInterval(() => {
  timeout.value = ((MAX_TIME - (Date.now(0) - start_time)) / MAX_TIME) * 100
  if (timeout.value <= 0) {
    clearInterval(myInterval)
    emit('nextPageCaptcha')
  }
}, 2)
</script>

<template>
  <div class="instructions prevent-select">
    <div class="image-container">
      <h1 class="title">Quickly rotate the object!</h1>
      <p class="is-size-5">Click the arrows to rotate until it looks correct.</p>

      <table class="table">
        <tbody>
          <tr>
            <td>
              <button class="button" @click="rotateImageDelta(-10)">
                Rotate Left&nbsp;&nbsp;<FAIcon icon="fa-solid fa-rotate-left" />
              </button>
            </td>
            <td>
              <img ref="imageRef" src="@/assets/captcha/cup.jpg" class="circular-image" alt="Circular Image" />
            </td>
            <td>
              <button class="button" @click="rotateImageDelta(10)">
                Rotate Right&nbsp;&nbsp;<FAIcon icon="fa-solid fa-rotate-right" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="button is-success" id="finish" @click="$emit('nextPageCaptcha')">Looks good to me!</button>
    </div>
    <br />
    <br />
    Respond quickly: <progress class="progress is-large" :value="timeout" max="100"></progress>
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
</style>

<style>
.image-container {
  margin: 0 auto;
}

.rotator {
  margin-top: 20px;
  width: 50%;
}

.table {
  margin: 0 auto;
}

.image-container td {
  vertical-align: middle;
  border: none;
}

.circular-image {
  display: block;
  width: 200px; /* Adjust as needed */
  border-radius: 50%;
  overflow: hidden;
  object-fit: cover;
}

.button-container {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.button-container button {
  margin: 0 5px;
}
</style>
