<script setup>
import { reactiveOmit } from '@vueuse/core'
import { Primitive } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'
import { badgeVariants } from '.'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  variant: { type: null, required: false },
  class: { type: null, required: false },
})

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive data-slot="badge" :class="cn(badgeVariants({ variant }), props.class)" v-bind="delegatedProps">
    <slot />
  </Primitive>
</template>
