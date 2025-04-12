<script setup>
import useAPI from '@/core/composables/useAPI'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const api = useAPI()
const route = useRoute()

// Reactively get the stepper for the current page
const stepper = computed(() => {
  return api.store.global.steppers?.[route.name]
})
</script>

<template>
  <div class="field has-addons">
    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="stepper?.goPrevStep()"
        data-tooltip="Step trial back"
        :disabled="!stepper || api.store.dev.pageProvidesTrialStepper == false"
      >
        <span>
          <FAIcon icon="fa-solid fa-angle-left" />
        </span>
      </button>
    </p>

    <p class="control">
      <button
        class="button is-small is-jump-bar has-tooltip-arrow has-tooltip-bottom"
        data-tooltip="Current stepper path"
        :disabled="!stepper || api.store.dev.pageProvidesTrialStepper == false"
      >
        <span class="counter" v-if="stepper?.paths">{{ stepper?.paths }}</span>
        <FAIcon icon="fa-solid fa-circle-minus" v-else />
      </button>
    </p>

    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="stepper?.goNextStep()"
        data-tooltip="Step trial forward"
        :disabled="!stepper || api.store.dev.pageProvidesTrialStepper == false"
      >
        <span>
          <FAIcon icon="fa-solid fa-angle-right" />
        </span>
      </button>
    </p>
  </div>
</template>

<style scoped>
.is-jump-bar {
  font-size: 0.65rem;
  height: 2em;
  margin: 0px;
}
.counter {
  font-size: 0.95em;
  padding-top: 2px;
  font-family: monospace;
  font-weight: 500;
}
</style>
