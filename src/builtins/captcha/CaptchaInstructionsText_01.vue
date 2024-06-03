<script setup>
const props = defineProps({
  adjective: String
})
const emit = defineEmits(['nextPageCaptcha'])
</script>

<template>
  <div class="instructions prevent-select">
    <h1 class="title">Lets play some {{ props.adjective }} games!</h1>
    <p class="is-size-5 has-text-left">
      Before we begin we'd like you to solve a couple quick problems for us, just to warm up your brain. They are common
      sense questions and tasks that should be easy and fun if you are a human and paying attention.
    </p>
    <p class="is-size-5 has-text-left">
      Each question will need to be answered <b>as quickly as possible</b>. If you don't respond in time it will move to
      the next question.
    </p>
    <p class="is-size-5 has-text-left">
      Before we begin we will give you practice with one of the tasks so you can see how it works. Your answer for this
      one doesn't matter.
    </p>
    <hr />
    <button class="button is-warning" id="finish" @click="$emit('nextPageCaptcha')">
      Let do a practice &nbsp;
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
