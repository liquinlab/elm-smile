<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import { useKeyModifier } from '@vueuse/core'
const altKeyState = useKeyModifier('Alt')
</script>

<template>
  <div class="field has-addons">
    <p class="control">
      <button
        v-if="altKeyState"
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.resetTrial()"
        data-tooltip="Reset trial to 0"
        :disabled="api.store.dev.page_provides_trial_stepper == false"
      >
        <span>
          <FAIcon icon="fa-solid fa-circle-chevron-left" />
        </span>
      </button>

      <button
        v-else
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.decrementTrial()"
        data-tooltip="Step trial back"
        :disabled="api.store.dev.page_provides_trial_stepper == false"
      >
        <span>
          <FAIcon icon="fa-solid fa-angle-left" />
        </span>
      </button>
    </p>

    <p class="control">
      <button
        class="button is-small is-jump-bar has-tooltip-arrow has-tooltip-bottom"
        data-tooltip="Current trial counter"
        :disabled="api.store.dev.page_provides_trial_stepper == false"
      >
        <span class="counter">{{ api.getPageTrackerIndex(api.currentRouteName()) }}</span>
      </button>
    </p>

    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.incrementTrial()"
        data-tooltip="Step trial forward"
        :disabled="api.store.dev.page_provides_trial_stepper == false"
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
</style>
