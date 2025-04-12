<script setup>
import { reactive } from 'vue'
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()
const props = defineProps(['triggered'])

const sizer = reactive({
  w: api.config.windowsizerRequest.width + 'px',
  h: api.config.windowsizerRequest.height + 'px',
})

function finish() {
  // smilestore.setConsented()
  // smilestore.saveData()
  api.verifyVisibility(true)
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <div class="sizer border-animation">
      <div class="info" v-if="!props.triggered">
        <span class="is-size-2">
          <FAIcon icon="fa-solid fa-arrows-up-down-left-right "></FAIcon>
        </span>
        <h1 class="is-size-4">
          Please adjust the size of your browser window until <b>ALL</b> four edges of this box are visible.
        </h1>
        <hr />
        <div class="is-8 is-size-7 has-text-left note">
          <b>Warning</b>: If you can't resize your window and see the entire box please click the red "withdraw" button
          at the top of the page and return the task. You need to be able view the entire page at once.
        </div>
        <hr />
        <br /><br />
        <button class="button is-info" id="finish" @click="finish()">
          It is visible now, I'm ready &nbsp;
          <FAIcon icon="fa-solid fa-arrow-right" />
        </button>
      </div>
      <div class="info" v-else>
        <span class="is-size-2">
          <FAIcon icon="fa-solid fa-arrows-up-down-left-right "></FAIcon>
        </span>
        <h1 class="is-size-4">
          <b>We don't want you to miss anything!</b><br />Please re-adjust the size of your browser window until
          <b>ALL</b> four edges of this box are visible.
        </h1>
        <hr />
        <div class="is-8 is-size-7 has-text-left note">
          <b>Warning</b>: If you can't resize your window and see the entire box please click the red "withdraw" button
          at the top of the page and return the task. You need to be able view the entire page at once.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info {
  width: 65%;
  padding-top: 30px;
  margin: auto;
  color: rgb(18, 53, 90);
}

.note {
  color: rgb(64, 91, 121);
}

hr {
  background-color: rgb(18, 53, 90);
}

.sizer {
  background-color: rgb(208, 242, 251);
  /*border: 2px dashed red;*/
  width: v-bind(sizer.w);
  height: v-bind(sizer.h);
  margin-left: auto;
  margin-right: auto;
  vertical-align: center;
  padding-top: auto;
  padding: 20px;
  align: center;
}

.border-animation {
  background-image:
    linear-gradient(90deg, rgb(18, 53, 90) 50%, transparent 50%),
    linear-gradient(90deg, rgb(18, 53, 90) 50%, transparent 50%),
    linear-gradient(0deg, rgb(18, 53, 90) 50%, transparent 50%),
    linear-gradient(0deg, rgb(18, 53, 90) 50%, transparent 50%);
  background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
  background-size:
    15px 2px,
    15px 2px,
    2px 15px,
    2px 15px;
  background-position:
    left top,
    right bottom,
    left bottom,
    right top;
  animation: border-dance 0.5s infinite linear;
}

@keyframes border-dance {
  0% {
    background-position:
      left top,
      right bottom,
      left bottom,
      right top;
  }

  100% {
    background-position:
      left 15px top,
      right 15px bottom,
      left bottom 15px,
      right top 15px;
  }
}
</style>
