<script setup>
import { onMounted } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

onMounted(async () => {
  let catURL = await api.getStaticUrl('cat.mp4')
  let catVid = document.getElementById('cat')
  catVid.src = catURL
});

function finish() {
  // smilestore.saveData()
  api.stepNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Experiment</h1>
    <hr />
    <video id="cat" width="200px" playsinline autoplay muted loop preload="auto"></video>
    <br>
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
