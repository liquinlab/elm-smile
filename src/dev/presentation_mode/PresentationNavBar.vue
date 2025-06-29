<script setup>
import { onMounted, watch, ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import RouteInfoButton from '@/dev/developer_mode/RouteInfoButton.vue'
import ResetButton from '@/dev/presentation_mode/PresentationModeResetButton.vue'
import QRCodeButton from '@/dev/presentation_mode/QRCodeButton.vue'
import DarkModeButton from '@/dev/presentation_mode/DarkModeButton.vue'
import { Presentation } from 'lucide-vue-next'
</script>

<template>
  <nav class="flex items-center justify-between w-full border-b min-h-[36px] max-h-[36px] text-sm px-2">
    <!-- Left section - anchored to the left -->
    <div class="flex items-center flex-shrink-0 px-2 py-1 rounded">
      <div class="flex items-center">
        <div class="hidden sm:block">
          <div class="flex items-center text-xs font-normal">
            <i-uil-presentation-line class="size-4 mr-1" /><b>PRESENTATION MODE</b>
          </div>
        </div>
        <div class="block sm:hidden">
          <div class="flex items-center text-xs font-semibold"><Presentation class="size-4 mr-1" /><b>PRES</b></div>
        </div>
      </div>
    </div>

    <!-- Middle section - centered -->
    <div class="flex items-center justify-center flex-1 min-w-0 px-2 py-1 rounded">
      <div class="flex items-center space-x-2">
        <!-- Add any middle content here -->
        <div class="text-xs text-gray-600">
          <!-- Middle content placeholder -->
        </div>
      </div>
    </div>

    <!-- Right section - anchored to the right -->
    <div class="flex items-center flex-shrink-0 px-1 py-1 rounded">
      <div class="flex items-center space-x-2.5 border-gray-300 pl-4 rounded-l">
        <!-- dark mode button -->
        <div class="flex items-center">
          <DarkModeButton></DarkModeButton>
        </div>

        <!-- QR code button -->
        <div class="flex items-center">
          <QRCodeButton></QRCodeButton>
        </div>

        <!-- reset button -->
        <div class="flex items-center">
          <ResetButton></ResetButton>
        </div>

        <!-- route info buttons -->
        <div class="hidden md:flex items-center">
          <RouteInfoButton></RouteInfoButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
a:hover {
  color: #10dffa;
}

/* Keep any custom styles that might be needed for child components */
</style>
