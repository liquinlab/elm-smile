<script setup>
import { ref, reactive, watch } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
import { useRouter } from 'vue-router'
const router = useRouter()
import useSmileStore from '@/core/stores/smilestore'
const smilestore = useSmileStore() // load the global store
const seed = ref(smilestore.getSeedID)
import { v4 as uuidv4 } from 'uuid'
import TextInputWithButton from '@/dev/developer_mode/TextInputWithButton.vue'
import { Button } from '@/uikit/components/ui/button'
import { Input } from '@/uikit/components/ui/input'
import { Switch } from '@/uikit/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

function randomize_seed() {
  // seed.value = uuidv4()
  //seed = smilestore.randomizeSeed()
  api.debug('Setting seed to ', seed.value)
  smilestore.setSeedID(seed.value)
  // Force a reload to resample conditions and variables
  router.go(0)
}

// define selected condition in toolbar from current conditions
const selected = smilestore.getConditions

// when toolbar selection changes, change conditions in the data
function changeCond(key, value) {
  smilestore.setCondition(key, value)
  // Force a reload to resample conditions and variables
  router.go(0)
}

// when condition is set in the data, update the toolbar conditions
watch(
  () => smilestore.data.conditions,
  async (newConds) => {
    // for each key in newConds, update that entry in conditions
    Object.keys(newConds).forEach((key) => {
      selected[key] = newConds[key]
    })
  }
)

// Add this function from TreeNode.vue
const getBranchType = (index, total) => {
  if (index === 0) {
    return '┌─ '
  } else if (index === total - 1) {
    return '└─ '
  } else {
    return '├─ '
  }
}
</script>
<template>
  <TooltipProvider>
    <div class="h-fit p-0 m-0">
      <div
        class="subsection"
        v-if="
          smilestore.browserPersisted.possibleConditions &&
          Object.keys(smilestore.browserPersisted.possibleConditions).length > 0
        "
      >
        <div
          class="text-xs font-extrabold text-left bg-muted text-muted-foreground px-2 py-1.5 m-0 border-t border-b border-border"
        >
          Random Variables
        </div>

        <div class="relative m-0 p-0 pt-1.5">
          <ul class="list-none p-0 m-0 text-left ml-1.5 pb-2">
            <template v-for="(value, key, index) in smilestore.browserPersisted.possibleConditions" :key="key">
              <li class="flex items-center mb-0 ml-0.5 mt-1">
                <span class="font-mono text-sm text-gray-500 whitespace-pre mr-0">{{
                  getBranchType(index, Object.keys(smilestore.browserPersisted.possibleConditions).length)
                }}</span>
                <Select :model-value="selected[key]" @update:model-value="(val) => changeCond(key, val)">
                  <SelectTrigger class="h-7 text-[0.65rem] py-1 px-1font-mono font-bold">
                    <SelectValue :placeholder="`${key}: ${selected[key]}`" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="cond in value" :key="cond" :value="cond"> {{ key }}: {{ cond }} </SelectItem>
                  </SelectContent>
                </Select>
              </li>
            </template>
          </ul>
          <div class="text-xs text-muted-foreground absolute top-0 right-3">see design.js</div>
        </div>
      </div>
      <div
        class="text-xs text-muted-foreground font-extrabold text-left bg-muted px-2 py-1.5 m-0 border-t border-b border-border"
      >
        Set seed
      </div>
      <div class="mt-0 p-0 z-50">
        <div class="flex items-center gap-2">
          <div class="w-8">
            <Tooltip>
              <TooltipTrigger>
                <Switch
                  :model-value="smilestore.browserPersisted.useSeed"
                  @update:model-value="smilestore.browserPersisted.useSeed = $event"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Use fixed seed</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div class="flex-1">
            <div class="relative inline-block">
              <Input
                v-model="seed"
                type="text"
                placeholder="Current seed"
                class="h-5 text-xs font-mono pr-8 w-44 ml-1"
              />
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="absolute right-1 top-0 h-5 w-6 p-0"
                    @click="randomize_seed()"
                  >
                    <FAIcon icon="fa-solid fa-arrow-right" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set new seed</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>

<style scoped>
/* Remove all Bulma-specific styles and keep only custom styles if needed */
</style>
