<script setup>
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <input class="input" v-model="text" placeholder="Type here" />
  <p><b>You typed: </b>{{ text }}</p>
</template>

<style scoped>
.input {
  font-weight: bold;
  background-color: lightgray;
}
</style>
