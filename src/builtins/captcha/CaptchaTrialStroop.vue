<script setup>
const emit = defineEmits(['nextPageCaptcha'])
</script>

<template>
  <div class="instructions">
    <h1 class="title">Stroop test!</h1>
    <p class="is-size-5 has-text-left">XXX</p>
    <hr />
    <button class="button is-success" id="finish" @click="$emit('nextPageCaptcha')">I'm ready</button>
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
