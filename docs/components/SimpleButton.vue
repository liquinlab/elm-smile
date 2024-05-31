<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button class="button" @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
  background-color: lightblue;
}
</style>
