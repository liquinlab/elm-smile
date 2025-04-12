<script setup>
import { ref } from 'vue'
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()
const ntrials = ref(1)

function finish() {
  // do stuff if you want
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <h1 class="title is-3">Task 1</h1>

    <div class="formcontent">
      <FormKit
        type="text"
        name="zipcode"
        label="Number of trials"
        placeholder="Enter zip or postal code"
        validation="optional"
        v-model="ntrials"
        help="How many trials do you want to do?"
      />

      <div class="formbutton">
        <button class="button is-success" id="finish" @click="finish()">
          next &nbsp;
          <FAIcon icon="fa-solid fa-arrow-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.formcontent {
  width: 25%;
  margin: auto;
  margin-bottom: 40px;
  padding-bottom: 200px;
  text-align: left;
}

.formbutton {
  margin-top: 1px solid #ccc;
  padding-top: 10px;
  text-align: right;
}
</style>
