<script setup>
import { ref, computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/uikit/components/ui/select'

const api = useAPI()

// Device presets
const devicePresets = {
  iphone: { width: 393, height: 852, name: 'iPhone' },
  'iphone-plus': { width: 430, height: 932, name: 'iPhone Plus' },
  'iphone-pro': { width: 402, height: 874, name: 'iPhone Pro' },
  'iphone-pro-max': { width: 440, height: 956, name: 'iPhone Pro Max' },
  'iphone-se': { width: 375, height: 667, name: 'iPhone SE' },
  'ipad-11': { width: 1180, height: 820, name: 'iPad 11-inch' },
  'ipad-13': { width: 1366, height: 1024, name: 'iPad 13-inch' },
  desktop1: { width: 800, height: 600, name: '800x600' },
  desktop2: { width: 1024, height: 768, name: '1024x768' },
  desktop3: { width: 1280, height: 1024, name: '1280x1024' },
  desktop4: { width: 1440, height: 900, name: '1440x900' },
  desktop5: { width: 1600, height: 1200, name: '1600x1200' },
  desktop16: { width: 1920, height: 1080, name: '1920x1080' },
}

// Handle device selection from dropdown
const handleDeviceChange = (value) => {
  console.log('handleDeviceChange called with:', value)

  if (value === 'custom') {
    api.store.dev.selectedDevice = 'custom'
    return
  }

  const preset = devicePresets[value]
  console.log('preset found:', preset)

  if (preset) {
    // Update the device dimensions in the store
    api.store.dev.deviceWidth = preset.width
    api.store.dev.deviceHeight = preset.height
    api.store.dev.selectedDevice = value
    console.log('Updated dimensions to:', api.store.dev.deviceWidth, 'x', api.store.dev.deviceHeight)
  } else {
    console.log('No preset found for value:', value)
  }
}
</script>

<template>
  <Select v-model="api.store.dev.selectedDevice" @update:modelValue="handleDeviceChange">
    <SelectTrigger class="select-small">
      <SelectValue placeholder="Custom size" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel class="mt-2">Mobile</SelectLabel>
        <SelectItem value="iphone"> iPhone </SelectItem>
        <SelectItem value="iphone-plus"> iPhone Plus </SelectItem>
        <SelectItem value="iphone-pro"> iPhone Pro </SelectItem>
        <SelectItem value="iphone-pro-max"> iPhone Pro Max </SelectItem>
        <SelectItem value="iphone-se"> iPhone SE </SelectItem>
      </SelectGroup>
      <SelectGroup>
        <SelectLabel class="mt-2">Tablet</SelectLabel>
        <SelectItem value="ipad-11"> iPad 11-inch </SelectItem>
        <SelectItem value="ipad-13"> iPad 13-inch</SelectItem>
      </SelectGroup>
      <SelectGroup>
        <SelectLabel class="mt-2">Desktop</SelectLabel>
        <SelectItem value="desktop1"> 800x600</SelectItem>
        <SelectItem value="desktop2"> 1024x768</SelectItem>
        <SelectItem value="desktop3"> 1280x1024</SelectItem>
        <SelectItem value="desktop4"> 1440x900</SelectItem>
        <SelectItem value="desktop5"> 1600x1200</SelectItem>
        <SelectItem value="desktop16"> 1920x1080</SelectItem>
      </SelectGroup>
      <SelectGroup>
        <SelectLabel class="mt-2">Other</SelectLabel>
        <SelectItem value="custom"> Custom size </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<style scoped>
/* Make select smaller */
:deep(.select-small) {
  height: 28px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
}

:deep(.select-small svg) {
  width: 12px !important;
  height: 12px !important;
}
</style>
