<script setup>
import { reactiveOmit } from '@vueuse/core'
import { SplitterGroup, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'

const props = defineProps({
  id: { type: [String, null], required: false },
  autoSaveId: { type: [String, null], required: false },
  direction: { type: String, required: true },
  keyboardResizeBy: { type: [Number, null], required: false },
  storage: { type: Object, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
})
const emits = defineEmits(['layout'])

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SplitterGroup
    data-slot="resizable-panel-group"
    v-bind="forwarded"
    :class="cn('flex h-full w-full data-[orientation=vertical]:flex-col', props.class)"
  >
    <slot />
  </SplitterGroup>
</template>
