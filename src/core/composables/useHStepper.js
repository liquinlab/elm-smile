import { shuffle } from '@/core/randomization'
import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'
import { useRoute } from 'vue-router'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'
import config from '@/core/config'
import { v4 as uuidv4 } from 'uuid'
import { createTableAPI, getProtectedMethods } from './TableAPI'

export function useHStepper() {
  const smilestore = useSmileStore()
  const log = useLog()
  const route = useRoute()
  const page = route.name
  smilestore.dev.page_provides_trial_stepper = true

  // Create a StepperStateMachine instance
  const sm = new StepperStateMachine()

  // Internal storage for trial tables
  const trialTables = new Map()

  function nextStep() {
    log.log('STEPPER: Advancing to next step')
    // unimplemented
  }

  function prevStep() {
    log.warn('TRIAL STEPPER: Rewinding to prev trial')
    // unimplemented
  }

  function resetStep() {
    smilestore.resetPageTracker(page)
  }

  const step_index = computed(() => {
    return smilestore.getPageTrackerIndex(page)
  })

  const step = computed(() => {
    return trials[step_index.value]
  })

  // Get all methods from tableAPI that should be protected
  const PROTECTED_METHODS = getProtectedMethods()

  // Create the chainable API
  const api = {
    next: nextStep,
    prev: prevStep,
    reset: resetStep,
    index: () => step_index.value,
    current: () => step.value,
    sm,

    // Protected chainable methods that throw if called before new()
    ...Object.fromEntries(
      PROTECTED_METHODS.map((method) => [
        method,
        function () {
          throw new Error(`${method}() must be called after new()`)
        },
      ])
    ),

    // Chainable methods for trial building
    new() {
      const tableId = uuidv4()
      const table = createTableAPI(api)

      // Create a proxy to handle array indexing
      const proxiedTable = new Proxy(table, {
        get(target, prop) {
          // Handle numeric indexing
          if (typeof prop === 'string' && !isNaN(prop)) {
            const row = target.rows[parseInt(prop)]
            if (row) {
              // Return a proxy for the row that adds the chainable API
              return new Proxy(row, {
                get(rowTarget, rowProp) {
                  // If the property is new(), return a function that creates a new table
                  if (rowProp === 'new') {
                    return () => {
                      const newTable = api.new()
                      // Store the new table in a Symbol to hide it from enumeration
                      const tableSymbol = Symbol.for('table')
                      rowTarget[tableSymbol] = newTable
                      return newTable
                    }
                  }
                  // Return the table if explicitly requested via Symbol
                  if (rowProp === Symbol.for('table')) {
                    return rowTarget[Symbol.for('table')]
                  }
                  // Hide the table property during normal property access
                  if (rowProp === 'table') {
                    return undefined
                  }
                  if (rowProp === 'length') {
                    return 1
                  }
                  return rowTarget[rowProp]
                },
                // Hide the table property from enumeration and JSON stringification
                ownKeys(rowTarget) {
                  return Object.keys(rowTarget).filter((key) => key !== 'table')
                },
                getOwnPropertyDescriptor(rowTarget, prop) {
                  if (prop === 'table') return undefined
                  return Object.getOwnPropertyDescriptor(rowTarget, prop)
                },
              })
            }
            return row
          }
          // Handle all other properties normally
          return target[prop]
        },
      })
      trialTables.set(tableId, proxiedTable)
      return proxiedTable
    },
  }

  return api
}

export default useHStepper
