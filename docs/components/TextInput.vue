<script setup>
import { ref } from 'vue'
const text = ref('')
</script>

<template>
  <input class="bulma-input" v-model="text" placeholder="Type here" />
  <p><b>You typed: </b>{{ text }}</p>
</template>

<style scoped>
.bulma-input {
  font-weight: bold;
  color: black;
  background-color: #fff;
}

::placeholder {
  color: #d1d1d1;
}
</style>
