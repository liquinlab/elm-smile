<script setup>
import { reactiveOmit } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import { provide } from "vue";
import { cn } from '@/uikit/lib/utils';

const props = defineProps({
  disabled: { type: Boolean, required: false },
  orientation: { type: String, required: false, default: "horizontal" },
  dir: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false, default: "div" },
  class: { type: null, required: false },
  variant: { type: null, required: false },
  size: { type: null, required: false },
});

const emits = defineEmits([]);

provide("buttonGroup", {
  variant: props.variant,
  size: props.size,
});

const delegatedProps = reactiveOmit(props, "class", "size", "variant");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <div
    data-slot="button-group"
    :data-size="size"
    :data-variant="variant"
    v-bind="forwarded"
    :class="
      cn(
        'group/button-group flex w-fit items-center rounded-md',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template> 