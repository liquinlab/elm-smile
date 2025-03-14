<script setup>
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const stepper = api.useHStepper()

const trials = stepper.table().append([
  { type: 'trial', id: 1 },
  { type: 'trial', id: 2 },
])

stepper.push(trials)
</script>

<template>
  <div>
    <h1 class="title">Stepper Test</h1>
    Path String: {{ stepper.paths }}<br />
    Path: {{ stepper.path }}<br />
    Current: {{ stepper.current }}<br />
    <button @click="stepper.prev()" class="button is-primary m-2">Prev</button>
    <button @click="stepper.reset()" class="button is-danger m-2">Reset</button>
    <button @click="stepper.next()" class="button is-primary m-2">Next</button>
    <br />
    Tree diagram:
    <div class="treediagram">
      <pre>{{ stepper.sm.getTreeDiagram() }}</pre>
    </div>
  </div>
</template>

<style scoped>
.treediagram {
  text-align: left;
  width: 200px;
  margin: 0 auto;
}
</style>
