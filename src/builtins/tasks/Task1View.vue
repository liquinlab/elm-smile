<script setup>
import { ref } from 'vue'
// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useViewAPI()
const ntrials = ref(1)

function finish() {
  // do stuff if you want
  api.goNextView()
}
</script>

<template>
  <div class="w-4/5 py-10 select-none mx-auto ">
    <h1 class="text-2xl font-bold mb-4">Task 1</h1>

    <div class="w-1/4 mx-auto mb-10 pb-52 text-left">
      <FormKit
        type="text"
        name="zipcode"
        label="Number of trials"
        placeholder="Enter zip or postal code"
        validation="optional"
        v-model="ntrials"
        help="How many trials do you want to do?"
      />

      <div class="mt-4 pt-2.5 text-right">
        <Button variant="default" @click="finish()">
          next
          <FAIcon icon="fa-solid fa-arrow-right" />
        </Button>
      </div>
    </div>
  </div>
</template>
