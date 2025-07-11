<template>
  <div class="space-y-6">
    <div>
      <h4 class="text-sm font-medium mb-2">Basic Checkboxes</h4>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <Checkbox />
          <label class="text-sm">Unchecked</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox :modelValue="true" />
          <label class="text-sm">Checked</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox disabled />
          <label class="text-sm">Disabled</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox :modelValue="true" disabled />
          <label class="text-sm">Checked & Disabled</label>
        </div>
      </div>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Color Variants</h4>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <Checkbox variant="default" :modelValue="true"/>
          <label class="text-sm">Default</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox variant="primary" :modelValue="true"/>
          <label class="text-sm">Primary</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox variant="info" :modelValue="true"/>
          <label class="text-sm">Info</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox variant="success" :modelValue="true"/>
          <label class="text-sm">Success</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox variant="warning" :modelValue="true"/>
          <label class="text-sm">Warning</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox variant="danger" :modelValue="true"/>
          <label class="text-sm">Danger</label>
        </div>
      </div>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Sizes</h4>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <Checkbox size="xs" :modelValue="true"/>
          <label class="text-sm">Extra Small</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox size="sm" :modelValue="true"/>
          <label class="text-sm">Small</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox size="default" :modelValue="true"/>
          <label class="text-sm">Default</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox size="lg" :modelValue="true"/>
          <label class="text-sm">Large</label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox size="xl" :modelValue="true"/>
          <label class="text-sm">Extra Large</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Checkbox } from '@/uikit/components/ui/checkbox'
</script>