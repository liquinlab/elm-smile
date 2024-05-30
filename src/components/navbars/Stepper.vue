<script setup>
import useSmileAPI from '@/core/composables/smileapi'
const api = useSmileAPI()
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
</script>

<template>
  <div class="field has-addons">
    <p class="control" v-if="api.hasPrevRoute()">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="router.go(-1)"
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
    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.decrementTrial()"
        data-tooltip="Step trial back"
        :disabled="api.dev.page_provides_trial_stepper == false"
      >
        <span>
          <FAIcon icon="fa-solid fa-angle-left" />
        </span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.incrementTrial()"
        data-tooltip="Step trial forward"
        :disabled="api.dev.page_provides_trial_stepper == false"
      >
        <span>
          <FAIcon icon="fa-solid fa-angle-right" />
        </span>
      </button>
    </p>
    <p class="control" v-if="api.hasNextRoute()">
      <button
        class="button is-small devbar-button has-tooltip-arrow has-tooltip-bottom"
        v-on:click="api.stepNextRoute()"
        data-tooltip="Step page forward"
      >
        <span>
          <FAIcon icon="fa-solid fa-angles-right" />
        </span>
      </button>
    </p>
    <p class="control" v-else>
      <button class="button is-small devbar-button" disabled>
        <span>
          <FAIcon icon="fa-solid fa-angles-right" />
        </span>
      </button>
    </p>
  </div>
</template>
