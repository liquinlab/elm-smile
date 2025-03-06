import { shuffle } from '@/core/randomization'
import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'
import { useRoute } from 'vue-router'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'
import config from '@/core/config'

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

  // Helper function to handle array padding/looping
  function adjustArrayLength(arr, targetLength, method = 'pad', padValue = null) {
    if (arr.length >= targetLength) return arr.slice(0, targetLength)

    if (method === 'loop') {
      const result = []
      while (result.length < targetLength) {
        result.push(...arr)
      }
      return result.slice(0, targetLength)
    } else {
      // pad
      const lastValue = padValue !== null ? padValue : arr[arr.length - 1]
      return [...arr, ...Array(targetLength - arr.length).fill(lastValue)]
    }
  }

  // Create the chainable API
  const api = {
    next: nextStep,
    prev: prevStep,
    reset: resetStep,
    index: () => step_index.value,
    current: () => step.value,
    sm,

    // Chainable methods for trial building
    new() {
      const tableId = Date.now().toString()
      const table = {
        rows: [],
        get length() {
          return this.rows.length
        },
        [Symbol.iterator]() {
          return this.rows[Symbol.iterator]()
        },
        get [Symbol.isConcatSpreadable]() {
          return true
        },
        indexOf(...args) {
          return this.rows.indexOf(...args)
        },
        slice(...args) {
          return this.rows.slice(...args)
        },
        append(input) {
          if (Array.isArray(input)) {
            const newLength = this.rows.length + input.length
            if (newLength > config.max_stepper_rows) {
              throw new Error(
                `append() would generate ${newLength} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of rows to append.`
              )
            }
            this.rows = [...this.rows, ...input]
          } else if (input && input.rows) {
            const newLength = this.rows.length + input.rows.length
            if (newLength > config.max_stepper_rows) {
              throw new Error(
                `append() would generate ${newLength} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of rows to append.`
              )
            }
            this.rows = [...this.rows, ...input.rows]
          }
          return this
        },
        shuffle() {
          // To be implemented
          return this
        },
        repeat(n) {
          if (n <= 0 || this.rows.length === 0) return this
          const totalRows = this.rows.length * n
          if (totalRows > config.max_stepper_rows) {
            throw new Error(
              `repeat() would generate ${totalRows} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the repeat count.`
            )
          }
          const originalRows = [...this.rows]
          for (let i = 1; i < n; i++) {
            this.rows = [...this.rows, ...originalRows]
          }
          return this
        },
        push() {
          // To be implemented
          return this
        },
        forEach(callback) {
          this.rows = this.rows.map((row, index) => {
            const modifiedRow = callback(row, index)
            return modifiedRow || row
          })
          return this
        },
        zip(trials, options = {}) {
          if (typeof trials !== 'object' || trials === null) {
            throw new Error('zip() requires an object with arrays as values')
          }

          const columns = Object.entries(trials)
          if (columns.length === 0) {
            throw new Error('zip() requires at least one column')
          }

          // Validate that all values are arrays
          if (!columns.every(([_, arr]) => Array.isArray(arr))) {
            throw new Error('zip() requires an object with arrays as values')
          }

          // Get the maximum length of any column
          const maxLength = Math.max(...columns.map(([_, arr]) => arr.length))

          // Check if any column has a different length
          const hasDifferentLengths = columns.some(([_, arr]) => arr.length !== maxLength)

          if (hasDifferentLengths && options.method === 'error') {
            throw new Error('All columns must have the same length when using zip()')
          }

          // Process each column according to the specified method
          const processedColumns = columns.map(([key, arr]) => {
            if (arr.length === maxLength) return arr

            const method = options.method || 'pad'
            const padValue = options.padValue

            return adjustArrayLength(arr, maxLength, method, padValue)
          })

          // Create the zipped rows
          const zippedRows = Array(maxLength)
            .fill(null)
            .map((_, i) => {
              const row = {}
              columns.forEach(([key], colIndex) => {
                row[key] = processedColumns[colIndex][i]
              })
              return row
            })

          const newLength = this.rows.length + zippedRows.length
          if (newLength > config.max_stepper_rows) {
            throw new Error(
              `zip() would generate ${newLength} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of values in your arrays.`
            )
          }

          this.rows = [...this.rows, ...zippedRows]
          return this
        },
        outer(trials, options = {}) {
          if (typeof trials !== 'object' || trials === null) {
            throw new Error('outer() requires an object with arrays as values')
          }

          const columns = Object.entries(trials)
          if (columns.length === 0) {
            throw new Error('outer() requires at least one column')
          }

          // Validate that all values are arrays
          if (!columns.every(([_, arr]) => Array.isArray(arr))) {
            throw new Error('outer() requires an object with arrays as values')
          }

          // Calculate total number of combinations
          const totalCombinations = columns.reduce((total, [_, arr]) => total * arr.length, 1)
          if (totalCombinations > config.max_stepper_rows) {
            throw new Error(
              `outer() would generate ${totalCombinations} combinations, which exceeds the safety limit of ${config.max_stepper_rows}. Consider using zip() or reducing the number of values in your arrays.`
            )
          }

          // Helper function to generate combinations
          function generateCombinations(arrays) {
            if (arrays.length === 0) return [{}]

            const [key, values] = arrays[0]
            const rest = arrays.slice(1)
            const restCombinations = generateCombinations(rest)

            return values.flatMap((value) =>
              restCombinations.map((combo) => ({
                [key]: value,
                ...combo,
              }))
            )
          }

          const outerRows = generateCombinations(columns)
          this.rows = [...this.rows, ...outerRows]
          return this
        },
      }
      // Create a proxy to handle array indexing
      const proxiedTable = new Proxy(table, {
        get(target, prop) {
          // Handle numeric indexing
          if (typeof prop === 'string' && !isNaN(prop)) {
            return target.rows[parseInt(prop)]
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
