<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

function go() {
  console.log('go')
  api.gotoView('instructions')
}
</script>
<template>
  <a href="/#instructions" class="button">Instructions</a>
  <button class="button" @click="go()">Jumper</button>
</template>
<style scoped></style>
