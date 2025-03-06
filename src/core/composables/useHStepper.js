import { shuffle } from '@/core/randomization'
import { ref, computed } from 'vue'
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'
import { useRoute } from 'vue-router'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'
import config from '@/core/config'
import { v4 as uuidv4 } from 'uuid'
import seedrandom from 'seedrandom'

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
  function adjustArrayLength(arr, targetLength, method = 'pad', padValue = undefined) {
    if (arr.length >= targetLength) return arr.slice(0, targetLength)

    if (method === 'loop') {
      const result = []
      while (result.length < targetLength) {
        result.push(...arr)
      }
      return result.slice(0, targetLength)
    } else {
      // pad
      const valueToPad = padValue === undefined ? arr[arr.length - 1] : padValue
      return [...arr, ...Array(targetLength - arr.length).fill(valueToPad)]
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

    // Protected chainable methods that throw if called before new()
    append() {
      throw new Error('append() must be called after new()')
    },
    shuffle() {
      throw new Error('shuffle() must be called after new()')
    },
    sample() {
      throw new Error('sample() must be called after new()')
    },
    repeat() {
      throw new Error('repeat() must be called after new()')
    },
    push() {
      throw new Error('push() must be called after new()')
    },
    forEach() {
      throw new Error('forEach() must be called after new()')
    },
    zip() {
      throw new Error('zip() must be called after new()')
    },
    outer() {
      throw new Error('outer() must be called after new()')
    },
    delete() {
      throw new Error('delete() must be called after new()')
    },

    // Chainable methods for trial building
    new() {
      const tableId = uuidv4()
      const table = {
        rows: [],
        deleted: false,

        get length() {
          this.checkDeleted()
          return this.rows.length
        },

        [Symbol.iterator]() {
          this.checkDeleted()
          return this.rows[Symbol.iterator]()
        },

        get [Symbol.isConcatSpreadable]() {
          this.checkDeleted()
          return true
        },

        indexOf(...args) {
          this.checkDeleted()
          return this.rows.indexOf(...args)
        },

        slice(...args) {
          this.checkDeleted()
          return this.rows.slice(...args)
        },

        append(input) {
          this.checkDeleted()
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

        shuffle(seed) {
          this.checkDeleted()
          // Only create a new RNG if a seed is provided
          // Otherwise use the global seeded RNG that was set by the router
          const rng = seed ? seedrandom(seed) : Math.random

          // Fisher-Yates shuffle algorithm
          for (let i = this.rows.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1))
            ;[this.rows[i], this.rows[j]] = [this.rows[j], this.rows[i]]
          }
          return this
        },

        sample(n) {
          this.checkDeleted()
          // To be implemented
          return this
        },

        repeat(n) {
          this.checkDeleted()
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
          this.checkDeleted()
          // To be implemented
          return this
        },

        forEach(callback) {
          this.checkDeleted()
          this.rows = this.rows.map((row, index) => {
            const modifiedRow = callback(row, index)
            return modifiedRow || row
          })
          return this
        },

        zip(trials, options = {}) {
          this.checkDeleted()
          if (typeof trials !== 'object' || trials === null) {
            throw new Error('zip() requires an object with arrays as values')
          }

          const columns = Object.entries(trials)
          if (columns.length === 0) {
            throw new Error('zip() requires at least one column')
          }

          // Convert non-array values to single-element arrays
          const processedColumns = columns.map(([key, value]) => {
            if (Array.isArray(value)) return [key, value]
            return [key, [value]]
          })

          // Get the maximum length of any column
          const maxLength = Math.max(...processedColumns.map(([_, arr]) => arr.length))

          // Check safety limit first
          const newLength = this.rows.length + maxLength
          if (newLength > config.max_stepper_rows) {
            throw new Error(
              `zip() would generate ${newLength} rows, which exceeds the safety limit of ${config.max_stepper_rows}. Consider reducing the number of values in your arrays.`
            )
          }

          // Check if any column has a different length
          const hasDifferentLengths = processedColumns.some(([_, arr]) => arr.length !== maxLength)

          // By default, throw error if lengths are different
          if (hasDifferentLengths && !options.method) {
            throw new Error(
              'All columns must have the same length when using zip(). Specify a method (loop, pad, last) to handle different lengths.'
            )
          }

          // Process each column according to the specified method
          const processedArrays = processedColumns.map(([key, arr]) => {
            if (arr.length === maxLength) return arr

            const method = options.method
            const padValue = options.padValue

            if (method === 'loop') {
              return adjustArrayLength(arr, maxLength, 'loop')
            } else if (method === 'pad') {
              if (padValue === undefined) {
                throw new Error('padValue is required when using the pad method')
              }
              return adjustArrayLength(arr, maxLength, 'pad', padValue)
            } else if (method === 'last') {
              return adjustArrayLength(arr, maxLength, 'pad', arr[arr.length - 1])
            } else {
              throw new Error(`Invalid method: ${method}. Must be one of: loop, pad, last`)
            }
          })

          // Create the zipped rows
          const zippedRows = Array(maxLength)
            .fill(null)
            .map((_, i) => {
              const row = {}
              processedColumns.forEach(([key], colIndex) => {
                row[key] = processedArrays[colIndex][i]
              })
              return row
            })

          this.rows = [...this.rows, ...zippedRows]
          return this
        },

        outer(trials, options = {}) {
          this.checkDeleted()
          if (typeof trials !== 'object' || trials === null) {
            throw new Error('outer() requires an object with arrays as values')
          }

          const columns = Object.entries(trials)
          if (columns.length === 0) {
            throw new Error('outer() requires at least one column')
          }

          // Convert non-array values to single-element arrays
          const processedColumns = columns.map(([key, value]) => {
            if (Array.isArray(value)) return [key, value]
            return [key, [value]]
          })

          // Calculate total number of combinations
          const totalCombinations = processedColumns.reduce((total, [_, arr]) => total * arr.length, 1)
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

          const outerRows = generateCombinations(processedColumns)
          this.rows = [...this.rows, ...outerRows]
          return this
        },

        checkDeleted() {
          if (this.deleted) throw new Error('Table has been deleted')
        },

        delete() {
          this.checkDeleted()
          this.deleted = true
          trialTables.delete(tableId)
          // Don't return this to end the chain
        },
      }

      // Create a proxy to handle array indexing
      const proxiedTable = new Proxy(table, {
        get(target, prop) {
          // Check deleted state before any property access
          if (prop !== 'deleted' && prop !== 'checkDeleted') {
            target.checkDeleted()
          }

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
