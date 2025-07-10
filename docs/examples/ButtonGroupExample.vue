<template>
  <div class="space-y-6">
    <div>
      <h4 class="text-sm font-medium mb-2">Default ButtonGroup</h4>
      <ButtonGroup>
        <ButtonGroupItem>Left</ButtonGroupItem>
        <ButtonGroupItem>Middle</ButtonGroupItem>
        <ButtonGroupItem>Right</ButtonGroupItem>
      </ButtonGroup>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Outline ButtonGroup</h4>
      <ButtonGroup variant="outline">
        <ButtonGroupItem>Option 1</ButtonGroupItem>
        <ButtonGroupItem>Option 2</ButtonGroupItem>
        <ButtonGroupItem>Option 3</ButtonGroupItem>
      </ButtonGroup>
    </div>
  </div>
</template>

<script setup>
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
</script>