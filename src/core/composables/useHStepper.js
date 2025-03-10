import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import { useRoute } from 'vue-router'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'
import { NestedTable } from '@/core/composables/NestedTable'

export function useHStepper() {
  const smilestore = useSmileStore()
  const route = useRoute()
  const page = route.name

  // this activates the stepper for the page in the dev tools
  smilestore.dev.page_provides_trial_stepper = true

  // Create instances of our state managers
  const sm = new StepperStateMachine()
  const nestedTable = new NestedTable()

  // Register page tracker if not already registered
  smilestore.registerPageTracker(page)

  // // Try to load existing state from smilestore
  // const savedState = smilestore.getPageTrackerData(page)?.stepperState
  // if (savedState) {
  //   log.log('STEPPER: Loading saved state from smilestore')
  //   sm.loadFromJSON(savedState)
  // }

  // Get all methods from table API that should be protected
  const PROTECTED_METHODS = nestedTable.getProtectedTableMethods()

  // Internal reactive refs
  const _currentValue = ref(null)
  const _currentPath = ref('')

  // Create the stepper object that will be returned
  const stepper = {
    // Navigation methods
    next: () => {
      const nextValue = sm.next()
      if (nextValue !== null) {
        _currentValue.value = sm.getDataAlongPath()
        _currentPath.value = sm.getCurrentPathStr()
      }
      return nextValue
    },
    prev: () => {
      const prevValue = sm.prev()
      if (prevValue !== null) {
        _currentValue.value = sm.getDataAlongPath()
        _currentPath.value = sm.getCurrentPathStr()
      }
      return prevValue
    },
    reset: () => {
      sm.reset()
      if (sm.stepState.states.length > 0) {
        sm.next() // Move to first state after reset
        _currentValue.value = sm.getDataAlongPath()
        _currentPath.value = sm.getCurrentPathStr()
      } else {
        _currentValue.value = null
        _currentPath.value = ''
      }
    },
    // Expose current and index as computed properties
    get current() {
      return _currentValue.value || []
    },
    get index() {
      return _currentPath.value
    },
    // Expose state machine with wrapped getData
    get sm() {
      return sm
    },

    // Create new table instance with access to stepper for nested tables
    table: () => {
      const table = nestedTable.createTable({ table: stepper.table, sm })
      // Add a method to handle initialization after push
      table.push = () => {
        // Push the table to the state machine
        sm.push_table(table.rows)
        // Initialize stepper's current value to match state machine
        if (sm.stepState.states.length > 0) {
          _currentValue.value = sm.getDataAlongPath()
          _currentPath.value = sm.getCurrentPathStr()
        }
        // Return the table for chaining
        return table
      }
      return table
    },
  }

  // Add protected methods to the stepper instance
  PROTECTED_METHODS.forEach((method) => {
    Object.defineProperty(stepper, method, {
      get() {
        throw new Error(`${method}() must be called after table()`)
      },
    })
  })

  return stepper
}

export default useHStepper
