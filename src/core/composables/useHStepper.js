import { shuffle } from '@/core/randomization'
import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'
import { useRoute } from 'vue-router'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'
import { NestedTable } from './NestedTable'

export function useHStepper() {
  const smilestore = useSmileStore()
  const log = useLog()
  const route = useRoute()
  const page = route.name
  smilestore.dev.page_provides_trial_stepper = true

  // Create instances of our state managers
  const sm = new StepperStateMachine()
  const nestedTable = new NestedTable()

  // Get all methods from table API that should be protected
  const PROTECTED_METHODS = nestedTable.getProtectedTableMethods()

  // Create the stepper control API
  const step = {
    next() {
      log.log('STEPPER: Advancing to next step')
      // unimplemented
    },
    prev() {
      log.warn('TRIAL STEPPER: Rewinding to prev trial')
      // unimplemented
    },
    reset() {
      smilestore.resetPageTracker(page)
    },
    index: computed(() => {
      return smilestore.getPageTrackerIndex(page)
    }),
    current: computed(() => {
      return trials[step.index.value]
    }),
    sm,
  }

  // Create the table creation API
  const table = {
    // Protected chainable methods that throw if called before new()
    ...Object.fromEntries(
      PROTECTED_METHODS.map((method) => [
        method,
        function () {
          throw new Error(`${method}() must be called after new()`)
        },
      ])
    ),

    // Create a new table instance
    new() {
      // Pass only the table API to avoid exposing stepper methods in nested tables
      return nestedTable.createTable(table)
    },
  }

  return {
    step,
    table,
  }
}

export default useHStepper
