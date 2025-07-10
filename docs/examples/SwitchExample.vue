<template>
  <div class="space-y-6">
    <div>
      <h4 class="text-sm font-medium mb-2">Basic Switches</h4>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <Switch />
          <label class="text-sm">Off</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch :modelValue="true" />
          <label class="text-sm">On</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch disabled />
          <label class="text-sm">Disabled</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch :modelValue="true" disabled />
          <label class="text-sm">On & Disabled</label>
        </div>
      </div>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Sizes</h4>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <Switch size="sm" />
          <label class="text-sm">Small</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch size="default" />
          <label class="text-sm">Default</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch size="lg" />
          <label class="text-sm">Large</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch size="xl" />
          <label class="text-sm">Extra Large</label>
        </div>
      </div>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Color Variants</h4>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <Switch variant="primary" :modelValue="true"/>
          <label class="text-sm">Primary</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch variant="info" :modelValue="true"/>
          <label class="text-sm">Info</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch variant="success" :modelValue="true"/>
          <label class="text-sm">Success</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch variant="warning" :modelValue="true"/>
          <label class="text-sm">Warning</label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch variant="danger" :modelValue="true"/>
          <label class="text-sm">Danger</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Switch } from '@/uikit/components/ui/switch'
</script>