<script setup>
import useAPI from '@/core/composables/useAPI'
import useSmileStore from '@/core/stores/smilestore'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const api = useAPI()
const store = useSmileStore()
const route = useRoute()

// Reactively get the stepper for the current page
const stepper = computed(() => {
  return store.global.steppers?.[route.name]
})

import { useKeyModifier } from '@vueuse/core'
const altKeyState = useKeyModifier('Alt')
</script>

<template>
  <div class="field has-addons">
<<<<<<< HEAD
=======
    <p class="control" v-if="api.hasPrevView()">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.goToView(route?.meta?.prev)"
        data-tooltip="Previous page"
      >
        <span>
          <FAIcon icon="fa-solid fa-angles-left" />
        </span>
      </button>
    </p>
    <p class="control" v-else>
      <button class="button is-small devbar-button" disabled>
        <span>
          <FAIcon icon="fa-solid fa-angles-left" />
        </span>
      </button>
    </p>
>>>>>>> main
    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="stepper?.prev()"
        data-tooltip="Step trial back"
        :disabled="!stepper || api.store.dev.page_provides_trial_stepper == false"
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
        :disabled="!stepper || api.store.dev.page_provides_trial_stepper == false"
      >
        <span class="counter" v-if="stepper?.paths">{{ stepper?.paths }}</span>
        <FAIcon icon="fa-solid fa-circle-minus" v-else />
      </button>
    </p>

    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="stepper?.next()"
        data-tooltip="Step trial forward"
        :disabled="!stepper || api.store.dev.page_provides_trial_stepper == false"
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
