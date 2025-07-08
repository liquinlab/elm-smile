<script setup>
import { watch, onUnmounted } from 'vue'
import useAPI from '@/core/composables/useAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useAPI()

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggleConsent'])

// Disable scrolling on main-content when modal is shown
watch(
  () => props.show,
  (isVisible) => {
    const mainContent = document.querySelector('.main-content')
    if (mainContent) {
      if (isVisible) {
        mainContent.style.overflow = 'hidden'
      } else {
        mainContent.style.overflow = ''
      }
    }
  },
  { immediate: true }
)

// Clean up on component unmount
onUnmounted(() => {
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    mainContent.style.overflow = ''
  }
})
</script>

<template>
  <div class="absolute inset-0 z-50 flex items-center justify-center p-8" :class="{ hidden: !show }">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('toggleConsent')"></div>
    <Button
      class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="close"
      @click="$emit('toggleConsent')"
    >
      <FAIcon icon="fa-solid fa-xmark" class="text-xl" />
    </Button>
    <div class="w-[90%] h-[90%] relative bg-background shadow-xl flex flex-col">
      <div class="flex-1 overflow-y-auto p-20 pt-10">
        <div class="select-none w-full">
          <div class="pt-5 text-foreground">
            <template v-if="api.getAppComponent">
              <component :is="api.getAppComponent('informed_consent_text')" />
            </template>
            <template v-else>
              <div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                Error: Unable to load consent form text. Please contact the study administrator.
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="border-t bg-muted px-5 py-4 flex justify-end">
        <Button @click="$emit('toggleConsent')"> Take me back! </Button>
      </div>
    </div>
  </div>
</template>
