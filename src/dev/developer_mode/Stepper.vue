<script setup>
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()
</script>

<template>
  <div class="field has-addons">
    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.goPrevStep()"
        data-tooltip="Step trial back"
        :disabled="!api.store.dev.viewProvidesStepper || !api.hasPrevStep()"
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
        :disabled="!api.store.dev.viewProvidesStepper || !api.hasSteps()"
      >
        <span class="counter" v-if="api.store.dev.viewProvidesStepper">{{ api.pathString }}</span>
        <FAIcon icon="fa-solid fa-circle-minus" v-else />
      </button>
    </p>

    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.goNextStep()"
        data-tooltip="Step trial forward"
        :disabled="!api.store.dev.viewProvidesStepper || !api.hasNextStep()"
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
