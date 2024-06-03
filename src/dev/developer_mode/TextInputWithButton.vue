<script setup>
const props = defineProps(['seed', 'tooltip'])
const emit = defineEmits(['action'])
</script>
<template>
  <div class="textinput">
    <input class="input is-small" type="text" placeholder="Current seed" size="15" width="10" :value="seed" />
    <button
      class="button is-small is-light removeedge has-tooltip-arrow has-tooltip-top"
      :data-tooltip="tooltip"
      @click="$emit('action')"
    >
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>

<style scoped>
.textinput {
  border: 0.1em solid #d2d2d2;
  border-radius: var(--bulma-radius-small);
  width: 100%;
  display: inline-block;
  position: relative;
  padding-left: 2px;
}
.textinput input {
  border: none;
  padding-right: 30px;
  font-family: var(--bulma-code);
  font-size: 0.85em;
  min-height: 30px;
}
.textinput button {
  position: absolute;
  right: 2px;
  top: 3px;
  padding: 7px;
  margin-right: 0px;
  margin-left: auto;
  border: none;
  box-shadow: none;
  background: #fff;
}
</style>
