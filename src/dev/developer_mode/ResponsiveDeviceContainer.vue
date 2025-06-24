<script setup>
import { ref, computed } from 'vue'

const deviceWidth = ref(393)
const deviceHeight = ref(852)
const selectedDevice = ref('iphone') // Track current device selection
const isRotated = ref(false) // Track rotation state
const isFullscreen = ref(false) // Track fullscreen state

const containerStyle = computed(() => ({
  '--device-width': `${deviceWidth.value}px`,
  '--device-height': `${deviceHeight.value}px`,
}))

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/uikit/components/ui/select'
import { Separator } from '@/uikit/components/ui/separator'
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

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
    selectedDevice.value = 'custom'
    return
  }

  const preset = devicePresets[value]
  console.log('preset found:', preset)

  if (preset) {
    deviceWidth.value = preset.width
    deviceHeight.value = preset.height
    selectedDevice.value = value
    console.log('Updated dimensions to:', deviceWidth.value, 'x', deviceHeight.value)
  } else {
    console.log('No preset found for value:', value)
  }
}

// Check if current dimensions match any preset
const checkForMatchingPreset = () => {
  for (const [key, preset] of Object.entries(devicePresets)) {
    if (deviceWidth.value === preset.width && deviceHeight.value === preset.height) {
      selectedDevice.value = key
      return
    }
  }
  // If no match found, keep as custom
  selectedDevice.value = 'custom'
}

// Resize functionality
const isResizing = ref(false)
const resizeDirection = ref('')
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

const startResize = (direction, event) => {
  isResizing.value = true
  resizeDirection.value = direction
  startX.value = event.clientX
  startY.value = event.clientY
  startWidth.value = deviceWidth.value
  startHeight.value = deviceHeight.value

  // Switch to custom size when starting to resize
  selectedDevice.value = 'custom'

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const handleResize = (event) => {
  if (!isResizing.value) return

  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value

  // Ensure we're in custom mode when resizing
  selectedDevice.value = 'custom'

  if (resizeDirection.value.includes('right')) {
    deviceWidth.value = Math.max(200, startWidth.value + deltaX)
  }
  if (resizeDirection.value.includes('left')) {
    const newWidth = Math.max(200, startWidth.value - deltaX)
    deviceWidth.value = newWidth
  }
  if (resizeDirection.value.includes('bottom')) {
    deviceHeight.value = Math.max(400, startHeight.value + deltaY)
  }
}

const stopResize = () => {
  isResizing.value = false
  resizeDirection.value = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)

  // Check if the final dimensions match any preset
  checkForMatchingPreset()
}

// Toggle rotation (swap width and height)
const toggleRotation = () => {
  const tempWidth = deviceWidth.value
  deviceWidth.value = deviceHeight.value
  deviceHeight.value = tempWidth
  isRotated.value = !isRotated.value

  // Check if the new dimensions match any preset
  checkForMatchingPreset()
}

// Toggle fullscreen mode
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}
</script>

<template>
  <!-- Fullscreen mode - just the slot content -->
  <div v-if="isFullscreen" class="fullscreen-container">
    <div class="fullscreen-controls">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="xs" @click="toggleFullscreen">
              <i-ri-pencil-ruler-2-fill class="!size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Responsive Design Mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <slot />
  </div>

  <!-- Normal device container mode -->
  <div v-else class="device-container-wrapper">
    <div class="device-info">
      <div class="device-controls">
        <Select v-model="selectedDevice" @update:modelValue="handleDeviceChange">
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
            </SelectGroup>
            <SelectGroup>
              <SelectLabel class="mt-2">Other</SelectLabel>
              <SelectItem value="custom"> Custom size </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" @click="toggleRotation">
                <i-carbon-rotate-counterclockwise-filled :class="{ 'text-blue-400': isRotated }" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Rotate device</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Separator orientation="vertical" />
        <div class="device-dimensions">{{ deviceWidth }} x {{ deviceHeight }}</div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" @click="toggleFullscreen">
                <i-ic-outline-fullscreen />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Fullscreen Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    <div class="device-wrapper">
      <div class="device-container" :style="containerStyle">
        <slot />
      </div>

      <!-- Resize handles -->
      <div class="resize-handle resize-handle-left" @mousedown="startResize('left', $event)"></div>
      <div class="resize-handle resize-handle-right" @mousedown="startResize('right', $event)"></div>
      <div class="resize-handle resize-handle-bottom" @mousedown="startResize('bottom', $event)"></div>
    </div>
  </div>
</template>

<style scoped>
.fullscreen-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.fullscreen-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-container-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  max-width: 100%;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: -1px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: auto;
}

.device-info {
  text-align: center;
  margin-bottom: 10px;
  font-family: monospace;
  font-size: 14px;
  margin-top: 10px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 5px;
}

.device-controls {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.device-controls > * {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-dimensions {
  font-family: monospace;
  font-size: 0.8em;
  color: var(--muted-foreground);
}

/* Make select smaller */
.device-controls :deep(.select-small) {
  height: 28px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
}

.device-controls :deep(.select-small svg) {
  width: 12px !important;
  height: 12px !important;
}

.device-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  flex-shrink: 1;
}

.device-container {
  display: inline-block;
  width: var(--device-width);
  height: var(--device-height);
  overflow-x: scroll;
  overflow-y: scroll;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
}

.resize-handle {
  position: absolute;
  background: #e0e0e0;
  border-radius: 20px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.resize-handle:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.resize-handle-left {
  top: 50%;
  left: -15px;
  width: 8px;
  height: 40px;
  cursor: ew-resize;
  transform: translateY(-50%);
}

.resize-handle-right {
  top: 50%;
  right: -15px;
  width: 8px;
  height: 40px;
  cursor: ew-resize;
  transform: translateY(-50%);
}

.resize-handle-bottom {
  bottom: -15px;
  left: 50%;
  width: 40px;
  height: 8px;
  cursor: ns-resize;
  transform: translateX(-50%);
}

.resize-handle-corner {
  bottom: -15px;
  right: -15px;
  width: 12px;
  height: 12px;
  cursor: nw-resize;
  border-radius: 50%;
}
</style>
