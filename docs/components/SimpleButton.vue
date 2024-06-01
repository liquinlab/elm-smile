<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button class="bulma-button" @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
  color: black;
  background-color: lightblue;
}
</style>
