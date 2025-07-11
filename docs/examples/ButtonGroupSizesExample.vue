<template>
  <div class="space-y-6">
    <div>
      <h4 class="text-sm font-medium mb-2">Extra Small</h4>
      <ButtonGroup size="xs">
        <ButtonGroupItem>Extra Small</ButtonGroupItem>
        <ButtonGroupItem>XS</ButtonGroupItem>
        <ButtonGroupItem>Tiny</ButtonGroupItem>
      </ButtonGroup>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Small</h4>
      <ButtonGroup size="sm">
        <ButtonGroupItem>Small</ButtonGroupItem>
        <ButtonGroupItem>SM</ButtonGroupItem>
        <ButtonGroupItem>Compact</ButtonGroupItem>
      </ButtonGroup>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Default</h4>
      <ButtonGroup size="default">
        <ButtonGroupItem>Default</ButtonGroupItem>
        <ButtonGroupItem>Normal</ButtonGroupItem>
        <ButtonGroupItem>Regular</ButtonGroupItem>
      </ButtonGroup>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Large</h4>
      <ButtonGroup size="lg">
        <ButtonGroupItem>Large</ButtonGroupItem>
        <ButtonGroupItem>LG</ButtonGroupItem>
        <ButtonGroupItem>Big</ButtonGroupItem>
      </ButtonGroup>
    </div>
    
    <div>
      <h4 class="text-sm font-medium mb-2">Extra Large</h4>
      <ButtonGroup size="xl">
        <ButtonGroupItem>Extra Large</ButtonGroupItem>
        <ButtonGroupItem>XL</ButtonGroupItem>
        <ButtonGroupItem>Huge</ButtonGroupItem>
      </ButtonGroup>
    </div>
  </div>
</template>

<script setup>
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
</script>