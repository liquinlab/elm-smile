<script setup>
const props = defineProps({
  percentage: Number,
  size: Number,
  strokeWidth: Number,
  basecolor: String,
  slicecolor: String,
})
</script>

<template>
  <div class="pie-chart">
    <svg viewBox="0 0 32 32">
      <circle r="16" cx="16" cy="16" />
    </svg>
  </div>
</template>

<style scoped>
.pie-chart {
  display: inline-block;
  margin-top: 3px;
}

svg {
  width: v-bind(size + 'px');
  height: v-bind(size + 'px');
  transform: rotate(-90deg);
  border-radius: 50%;
}

circle {
  fill: v-bind(basecolor);
  stroke: v-bind(slicecolor);
  stroke-width: 32;
  stroke-dasharray: v-bind(percentage) 100; /* for 38% */
}
</style>
