<script setup>
import { reactiveOmit } from '@vueuse/core'
import { ChevronRightIcon } from 'lucide-vue-next'
import { PaginationNext, useForwardProps } from 'reka-ui'
import { cn } from '@/uikit/lib/utils'
import { buttonVariants } from '@/uikit/components/ui/button'

const props = defineProps({
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  size: { type: null, required: false, default: 'default' },
  class: { type: null, required: false },
})

const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationNext
    data-slot="pagination-next"
    :class="cn(buttonVariants({ variant: 'ghost', size }), 'gap-1 px-2.5 sm:pr-2.5', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <span class="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </slot>
  </PaginationNext>
</template>
