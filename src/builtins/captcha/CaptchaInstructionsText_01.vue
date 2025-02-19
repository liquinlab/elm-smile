<script setup>
const props = defineProps({
  adjective: String,
})
const emit = defineEmits(['nextPageCaptcha'])
</script>

<template>
  <div class="instruct_text prevent-select">
    <h1 class="title">Let's warmup with some {{ props.adjective }} games!</h1>

    <p class="is-size-5 has-text-left">
      <img src="@/assets/captcha/warmup_brain.webp" width="300px" alt="Warm up your brain" />
      Before we begin we'd like you to solve a couple quick problems for us, just to warm up your brain. They are common
      sense questions and tasks that should be easy and fun if you are a human and paying attention.
    </p>
    <p class="is-size-5 has-text-left">
      Each question will need to be answered <b>as quickly as possible</b>. If you don't respond in time it will move to
      the next question. Working quickly is very important because it lets you save time on this experiment and earn
      more on other tasks.
    </p>
    <p class="is-size-5 has-text-left">
      Before we begin we will give you practice with one of the tasks so you can see how it works. Your answer for this
      one doesn't matter.
    </p>
    <hr />
    <button class="button is-warning" id="finish" @click="$emit('nextPageCaptcha')">
      Warm me up &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>

<style scoped>
.instruct_text {
  width: 80%;
  margin: auto;
}

.instruct_text p {
  padding-bottom: 20px;
}

.instruct_text img {
  float: right;
  padding: 10px;
}
</style>
