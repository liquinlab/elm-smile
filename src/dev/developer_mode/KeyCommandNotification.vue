<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  command: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="notification">
      <div class="command">{{ command }}</div>
      <div class="action">{{ action }}</div>
    </div>
  </Transition>
</template>

<style scoped>
.notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-align: center;
  z-index: 9999;
}

.command {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.action {
  font-size: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
