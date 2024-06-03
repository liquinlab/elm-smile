<script setup>
import { ref } from 'vue'
const emit = defineEmits(['nextPageCaptcha'])
const ready = ref(false)
</script>

<template>
  <div v-if="!ready" class="instructions prevent-select">
    <h1 class="title">Great job!</h1>
    <p class="is-size-5 has-text-left">
      Let's begin the main game. There will be many types of tasks. Each question will need to be answered
      <b>as quickly as possible</b>. If you don't respond in time it will move to the next question.
    </p>
    <p class="is-size-5 has-text-left">
      Only begin when you are ready to focus because if you fail to respond to too many questions, your answers are
      incorrect, your response times appear irregular, you may be flagged as likely a bot and your compensation may be
      denied.
    </p>
    <hr />
    <button class="button is-warning" id="finish" @click="ready = true">
      I'm ready &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>

  <div v-else class="instructions prevent-select">
    <h1 class="title">Are you sure?</h1>
    <p class="is-size-5 has-text-left">This game moves fast so you really need to be ready to pay attention!</p>
    <hr />
    <button class="button is-success" id="finish" @click="$emit('nextPageCaptcha')">
      Yes, I'm ready &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
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
