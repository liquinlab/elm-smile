/* eslint-disable no-undef */
// general testing functions
import { defineComponent, h } from 'vue'
//import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import seedrandom from 'seedrandom'

// import shared mocks
import '../../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../../setup/mocks'

// Mock the config import
vi.mock('@/core/config', () => ({
  default: {
    max_stepper_rows: 5000,
  },
}))

// import the API composable (h stepper is a method of the API)
import useAPI from '@/core/composables/useAPI'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'
import config from '@/core/config' // Add this import after the mock

// Create a test component that uses the composable
const TestComponent = defineComponent({
  template: `
    <div>
      <router-view></router-view>
    </div>
  `,
})

// Create a mock component for routes
const MockComponent = (text = 'Mock Component') =>
  defineComponent({
    name: 'MockComponent',
    setup() {
      const api = useAPI()
      const stepper = api.useHStepper()
      return { api, stepper }
    },
    template: `<div>${text}</div>`,
  })

// Define test routes
const routes = [
  {
    path: '/',
    name: 'welcome_anonymous',
    component: MockComponent('Welcome Anonymous'),
    meta: { next: 'landing', allowAlways: true },
  },
  {
    path: '/landing',
    name: 'landing',
    component: MockComponent('Landing'),
    meta: { prev: 'welcome_anonymous', next: 'test', sequential: true },
  },
  {
    path: '/test',
    name: 'test',
    component: MockComponent('Test'),
    meta: { prev: 'landing', sequential: true },
  },
]

describe('useHStepper composable', () => {
  let api
  let router
  let wrapper

  // Helper function to get the API instance for the current route
  const getCurrentRouteAPI = () => {
    const currentRoute = router.currentRoute.value
    const mockComponent = wrapper.findComponent(currentRoute.matched[0].components.default)
    expect(mockComponent.exists()).toBe(true)
    return mockComponent.vm.api
  }

  // Helper function to get the stepper instance for the current route
  const getCurrentRouteStepper = () => {
    const currentRoute = router.currentRoute.value
    const mockComponent = wrapper.findComponent(currentRoute.matched[0].components.default)
    expect(mockComponent.exists()).toBe(true)
    return mockComponent.vm.stepper
  }

  beforeAll(() => {
    setupBrowserEnvironment()
  })

  beforeEach(async () => {
    // Reset mock state
    vi.clearAllMocks()

    // Create a fresh router for each test
    router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    // Create pinia instance
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })

    // Mount the test component
    wrapper = mount(TestComponent, {
      global: {
        plugins: [pinia, router],
        stubs: {
          RouterLink: true,
        },
      },
    })

    // Navigate to the first route and wait for it to be ready
    await router.push('/')
    await router.isReady()
    await flushPromises()

    api = getCurrentRouteAPI()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('basic interactive checks', () => {
    it('should make sense to use', () => {
      const stepper = getCurrentRouteStepper()
      expect(stepper).toBeDefined()
      expect(stepper.next).toBeInstanceOf(Function)
      expect(stepper.prev).toBeInstanceOf(Function)
      expect(stepper.reset).toBeInstanceOf(Function)
    })
  })

  describe('basic creation operations', () => {
    it('should provide the useStepper method', async () => {
      expect(api).toBeDefined()
      expect(api.useHStepper).toBeDefined()
      expect(api.useHStepper).toBeInstanceOf(Function)
    })

    it('should create the stepper', async () => {
      const stepper = getCurrentRouteStepper()
      expect(stepper).toBeDefined()
    })

    it('should include the key top-level functions in the stepper', async () => {
      const stepper = getCurrentRouteStepper()
      expect(stepper).toBeDefined()
      expect(stepper.next).toBeInstanceOf(Function)
      expect(stepper.prev).toBeInstanceOf(Function)
      expect(stepper.reset).toBeInstanceOf(Function)
      expect(stepper.index).toBeInstanceOf(Function)
      expect(stepper.current).toBeInstanceOf(Function)
      expect(stepper.new).toBeInstanceOf(Function)
      expect(stepper.sm).toBeInstanceOf(StepperStateMachine)
    })

    it('should create a StepperStateMachine instance', async () => {
      const stepper = getCurrentRouteStepper()
      expect(stepper.sm).toBeInstanceOf(StepperStateMachine)
    })
  })

  describe('trial building functionality', () => {
    it('should provide the new() method', async () => {
      const stepper = getCurrentRouteStepper()
      expect(stepper.new).toBeInstanceOf(Function)
    })

    it('should create a new table with chainable methods', async () => {
      const stepper = getCurrentRouteStepper()
      const table = stepper.new()

      expect(table).toBeDefined()
      expect(table.rows).toBeDefined()
      expect(Array.isArray(table.rows)).toBe(true)
      expect(table.append).toBeInstanceOf(Function)
      expect(table.shuffle).toBeInstanceOf(Function)
      expect(table.sample).toBeInstanceOf(Function)
      expect(table.repeat).toBeInstanceOf(Function)
      expect(table.push).toBeInstanceOf(Function)
      expect(table.forEach).toBeInstanceOf(Function)
      expect(table.zip).toBeInstanceOf(Function)
      expect(table.range).toBeInstanceOf(Function)
      expect(table.outer).toBeInstanceOf(Function)
      expect(table.length).toBeDefined()
      expect(table.indexOf).toBeInstanceOf(Function)
      expect(table.slice).toBeInstanceOf(Function)
      expect(table[Symbol.iterator]).toBeInstanceOf(Function)
      expect(table[Symbol.isConcatSpreadable]).toBeDefined()
    })

    it('should throw errors if chain methods are called before new()', async () => {
      const stepper = getCurrentRouteStepper()

      // Test all chainable methods
      const methods = ['append', 'shuffle', 'sample', 'repeat', 'push', 'forEach', 'zip', 'outer', 'range']

      methods.forEach((method) => {
        expect(() => {
          stepper[method]()
        }).toThrow(`${method}() must be called after new()`)
      })
    })

    it('should provide array-like access to rows', async () => {
      const stepper = getCurrentRouteStepper()
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table = stepper.new().append(trials)

      // Test length
      expect(table.length).toBe(2)

      // Test array indexing
      expect(table[0]).toEqual(trials[0])
      expect(table[1]).toEqual(trials[1])

      // Test iteration
      const items = [...table]
      expect(items).toEqual(trials)

      // Test array methods
      expect(table.indexOf(trials[0])).toBe(0)
      expect(table.slice(0, 1)).toEqual([trials[0]])

      // Test spread operator
      const spreadArray = [...table]
      expect(spreadArray).toEqual(trials)
    })

    it('should create an empty table when new() is called without data operations', async () => {
      const stepper = getCurrentRouteStepper()
      const table = stepper.new()

      // Test empty state
      expect(table.length).toBe(0)
      expect(table.rows).toHaveLength(0)
      expect([...table]).toHaveLength(0)
      expect(table.slice()).toHaveLength(0)
      expect(table.indexOf({})).toBe(-1)

      // Test array-like properties still work
      expect(table[0]).toBeUndefined()
      expect(table[1]).toBeUndefined()
      expect(table[-1]).toBeUndefined()
    })

    it('should allow appending trials to a table', async () => {
      const stepper = getCurrentRouteStepper()
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table = stepper.new().append(trials)

      expect(table.rows).toHaveLength(2)
      expect(table.rows[0]).toEqual(trials[0])
      expect(table.rows[1]).toEqual(trials[1])
    })

    it('should allow building complex tables through multiple append operations', async () => {
      const stepper = getCurrentRouteStepper()

      // Create a table with multiple append operations
      const table = stepper
        .new()
        .append([{ color: 'red', shape: 'triangle' }])
        .append([{ color: 'blue', shape: 'square' }])
        .append([{ color: 'green', shape: 'circle' }])
        .append([{ color: 'yellow', shape: 'star' }])

      // Test the final state
      expect(table.rows).toHaveLength(4)
      expect(table.rows).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
        { color: 'yellow', shape: 'star' },
      ])

      // Test array-like access still works
      expect(table.length).toBe(4)
      expect(table[0]).toEqual({ color: 'red', shape: 'triangle' })
      expect(table[3]).toEqual({ color: 'yellow', shape: 'star' })
      expect([...table]).toHaveLength(4)
      expect(table.slice(1, 3)).toEqual([
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])
    })

    it('should allow modifying rows with forEach', async () => {
      const stepper = getCurrentRouteStepper()
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table = stepper
        .new()
        .append(trials)
        .forEach((row, index) => {
          if (index === 0) {
            return { ...row, color: 'green' }
          }
          return row
        })

      expect(table.rows).toHaveLength(2)
      expect(table.rows[0]).toEqual({ color: 'green', shape: 'triangle' })
      expect(table.rows[1]).toEqual({ color: 'blue', shape: 'square' })
    })

    it('should allow forEach to be chained with other methods', async () => {
      const stepper = getCurrentRouteStepper()
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table = stepper
        .new()
        .outer(trials)
        .forEach((row) => ({ ...row, size: 'medium' }))
        .append([{ shape: 'triangle', color: 'blue', size: 'large' }])

      expect(table.rows).toHaveLength(5)
      expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red', size: 'medium' })
      expect(table.rows[1]).toEqual({ shape: 'circle', color: 'green', size: 'medium' })
      expect(table.rows[2]).toEqual({ shape: 'square', color: 'red', size: 'medium' })
      expect(table.rows[3]).toEqual({ shape: 'square', color: 'green', size: 'medium' })
      expect(table.rows[4]).toEqual({ shape: 'triangle', color: 'blue', size: 'large' })
    })

    it('should handle forEach with no return value', async () => {
      const stepper = getCurrentRouteStepper()
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table = stepper
        .new()
        .append(trials)
        .forEach((row) => {
          row.color = 'green' // Direct mutation
        })

      expect(table.rows).toHaveLength(2)
      expect(table.rows[0]).toEqual({ color: 'green', shape: 'triangle' })
      expect(table.rows[1]).toEqual({ color: 'green', shape: 'square' })
    })

    it('should allow appending another table', async () => {
      const stepper = getCurrentRouteStepper()

      const table1 = stepper.new().append([{ color: 'red', shape: 'triangle' }])

      const table2 = stepper.new().append([{ color: 'blue', shape: 'square' }])

      table1.append(table2)

      expect(table1.rows).toHaveLength(2)
      expect(table1.rows[0]).toEqual({ color: 'red', shape: 'triangle' })
      expect(table1.rows[1]).toEqual({ color: 'blue', shape: 'square' })
    })

    it('should throw error when appending table would exceed safety limit', async () => {
      const stepper = getCurrentRouteStepper()
      const smallTable = stepper.new().append([{ color: 'blue', shape: 'square' }])

      expect(() => {
        const largeTable = stepper
          .new()
          .append(Array(config.max_stepper_rows + 1).fill({ color: 'red', shape: 'circle' }))
        smallTable.append(largeTable)
      }).toThrow(/append\(\) would generate \d+ rows, which exceeds the safety limit of \d+/)
    })

    describe('range functionality', () => {
      it('should throw error if range is called before new', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.range(10)
        }).toThrow('range() must be called after new()')
      })

      it('should create a range of rows', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new().range(10)
        expect(table.rows).toHaveLength(10)

        for (let i = 0; i < 10; i++) {
          expect(table.rows[i]).toEqual({ index: i })
        }
      })

      it('should throw error if range is called with non-positive number', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.new().range(0)
        }).toThrow('range() must be called with a positive integer')

        expect(() => {
          stepper.new().range(-1)
        }).toThrow('range() must be called with a positive integer')
      })
    })

    describe('zip functionality', () => {
      it('should throw error if zip is called before new', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.zip()
        }).toThrow('zip() must be called after new()')
      })

      it('should zip columns with equal lengths', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square', 'triangle'],
          color: ['red', 'green', 'blue'],
        }

        const table = stepper.new().zip(trials)

        expect(table.rows).toHaveLength(3)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table.rows[1]).toEqual({ shape: 'square', color: 'green' })
        expect(table.rows[2]).toEqual({ shape: 'triangle', color: 'blue' })
      })

      it('should throw error by default when columns have different lengths', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue'],
        }

        expect(() => {
          stepper.new().zip(trials)
        }).toThrow(
          'All columns must have the same length when using zip(). Specify a method (loop, pad, last) to handle different lengths.'
        )
      })

      it('should pad with specified value when using pad method', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue'],
        }

        const table = stepper.new().zip(trials, { method: 'pad', padValue: 'unknown' })

        expect(table.rows).toHaveLength(3)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table.rows[1]).toEqual({ shape: 'square', color: 'green' })
        expect(table.rows[2]).toEqual({ shape: 'unknown', color: 'blue' })
      })

      it('should handle null padValue', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue'],
        }

        // Test with null padValue
        const tableNull = stepper.new().zip(trials, { method: 'pad', padValue: null })
        expect(tableNull.rows).toHaveLength(3)
        expect(tableNull.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(tableNull.rows[1]).toEqual({ shape: 'square', color: 'green' })
        expect(tableNull.rows[2]).toEqual({ shape: null, color: 'blue' })
      })

      it('should throw error when padValue is undefined', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue'],
        }

        expect(() => {
          stepper.new().zip(trials, { method: 'pad' })
        }).toThrow('padValue is required when using the pad method')
      })

      it('should loop shorter columns', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue'],
        }

        const table = stepper.new().zip(trials, { method: 'loop' })

        expect(table.rows).toHaveLength(3)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table.rows[1]).toEqual({ shape: 'square', color: 'green' })
        expect(table.rows[2]).toEqual({ shape: 'circle', color: 'blue' })

        // Test with more loops
        const trials2 = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue', 'yellow', 'purple'],
        }

        const table2 = stepper.new().zip(trials2, { method: 'loop' })

        expect(table2.rows).toHaveLength(5)
        expect(table2.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table2.rows[1]).toEqual({ shape: 'square', color: 'green' })
        expect(table2.rows[2]).toEqual({ shape: 'circle', color: 'blue' })
        expect(table2.rows[3]).toEqual({ shape: 'square', color: 'yellow' })
        expect(table2.rows[4]).toEqual({ shape: 'circle', color: 'purple' })

        // Test with multiple columns of different lengths
        const trials3 = {
          shape: ['circle'],
          color: ['red', 'green', 'blue'],
          size: ['small', 'medium'],
        }

        const table3 = stepper.new().zip(trials3, { method: 'loop' })

        expect(table3.rows).toHaveLength(3)
        expect(table3.rows[0]).toEqual({ shape: 'circle', color: 'red', size: 'small' })
        expect(table3.rows[1]).toEqual({ shape: 'circle', color: 'green', size: 'medium' })
        expect(table3.rows[2]).toEqual({ shape: 'circle', color: 'blue', size: 'small' })
      })

      it('should repeat last value when using last method', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue'],
        }

        const table = stepper.new().zip(trials, { method: 'last' })

        expect(table.rows).toHaveLength(3)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table.rows[1]).toEqual({ shape: 'square', color: 'green' })
        expect(table.rows[2]).toEqual({ shape: 'square', color: 'blue' })
      })

      it('should throw error for invalid method', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green', 'blue'],
        }

        expect(() => {
          stepper.new().zip(trials, { method: 'invalid' })
        }).toThrow('Invalid method: invalid. Must be one of: loop, pad, last')
      })

      it('should throw error when zip would exceed safety limit', async () => {
        const stepper = getCurrentRouteStepper()

        // Create arrays that would exceed the limit when zipped
        const trials = {
          shape: Array(config.max_stepper_rows + 1).fill('circle'),
          color: ['red', 'green'],
        }

        expect(() => {
          stepper.new().zip(trials)
        }).toThrow(/zip\(\) would generate \d+ rows, which exceeds the safety limit of \d+/)
      })

      it('should be chainable with other methods', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green'],
        }

        const table = stepper
          .new()
          .zip(trials)
          .append([{ shape: 'triangle', color: 'blue' }])

        expect(table.rows).toHaveLength(3)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table.rows[1]).toEqual({ shape: 'square', color: 'green' })
        expect(table.rows[2]).toEqual({ shape: 'triangle', color: 'blue' })
      })

      it('should handle non-array values as single-element arrays', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: 'circle',
          color: ['red', 'green', 'blue'],
        }

        const table = stepper.new().zip(trials, { method: 'loop' })

        expect(table.rows).toHaveLength(3)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table.rows[1]).toEqual({ shape: 'circle', color: 'green' })
        expect(table.rows[2]).toEqual({ shape: 'circle', color: 'blue' })
      })

      it('should handle multiple non-array values', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: 'circle',
          color: 'red',
          size: ['small', 'medium'],
        }

        const table = stepper.new().zip(trials, { method: 'loop' })

        expect(table.rows).toHaveLength(2)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red', size: 'small' })
        expect(table.rows[1]).toEqual({ shape: 'circle', color: 'red', size: 'medium' })
      })

      it('should throw error for invalid input', async () => {
        const stepper = getCurrentRouteStepper()

        expect(() => {
          stepper.new().zip(null)
        }).toThrow('zip() requires an object with arrays as values')

        expect(() => {
          stepper.new().zip({})
        }).toThrow('zip() requires at least one column')
      })
    })

    describe('outer functionality', () => {
      it('should throw error if repeat is called before new', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.outer()
        }).toThrow('outer() must be called after new()')
      })

      it('should create factorial combinations of columns', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green'],
        }

        const table = stepper.new().outer(trials)

        expect(table.rows).toHaveLength(4)
        expect(table.rows).toEqual([
          { shape: 'circle', color: 'red' },
          { shape: 'circle', color: 'green' },
          { shape: 'square', color: 'red' },
          { shape: 'square', color: 'green' },
        ])
      })

      it('should handle three or more columns', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green'],
          size: ['small', 'large'],
        }

        const table = stepper.new().outer(trials)

        expect(table.rows).toHaveLength(8)
        expect(table.rows).toEqual([
          { shape: 'circle', color: 'red', size: 'small' },
          { shape: 'circle', color: 'red', size: 'large' },
          { shape: 'circle', color: 'green', size: 'small' },
          { shape: 'circle', color: 'green', size: 'large' },
          { shape: 'square', color: 'red', size: 'small' },
          { shape: 'square', color: 'red', size: 'large' },
          { shape: 'square', color: 'green', size: 'small' },
          { shape: 'square', color: 'green', size: 'large' },
        ])
      })

      it('should handle non-array values as single-element arrays', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: 'circle',
          color: ['red', 'green'],
        }

        const table = stepper.new().outer(trials)

        expect(table.rows).toHaveLength(2)
        expect(table.rows).toEqual([
          { shape: 'circle', color: 'red' },
          { shape: 'circle', color: 'green' },
        ])
      })

      it('should handle multiple non-array values', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: 'circle',
          color: 'red',
          size: ['small', 'medium'],
        }

        const table = stepper.new().outer(trials)

        expect(table.rows).toHaveLength(2)
        expect(table.rows).toEqual([
          { shape: 'circle', color: 'red', size: 'small' },
          { shape: 'circle', color: 'red', size: 'medium' },
        ])
      })

      it('should throw error for invalid input', async () => {
        const stepper = getCurrentRouteStepper()

        expect(() => {
          stepper.new().outer(null)
        }).toThrow('outer() requires an object with arrays as values')

        expect(() => {
          stepper.new().outer({})
        }).toThrow('outer() requires at least one column')
      })

      it('should throw error when combinations would exceed safety limit', async () => {
        const stepper = getCurrentRouteStepper()

        // This will generate 100 * 100 = 10000 combinations
        const trials = {
          x: Array(100).fill('x'),
          y: Array(100).fill('y'),
        }

        expect(() => {
          stepper.new().outer(trials)
        }).toThrow(/outer\(\) would generate 10000 combinations, which exceeds the safety limit of \d+/)
      })

      it('should allow combinations under the safety limit', async () => {
        const stepper = getCurrentRouteStepper()

        // This will generate 70 * 70 = 4900 combinations (under the 5000 limit)
        const trials = {
          x: Array(70).fill('x'),
          y: Array(70).fill('y'),
        }

        const table = stepper.new().outer(trials)
        expect(table.rows).toHaveLength(4900)
      })

      it('should be chainable with other methods', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = {
          shape: ['circle', 'square'],
          color: ['red', 'green'],
        }

        const table = stepper
          .new()
          .outer(trials)
          .append([{ shape: 'triangle', color: 'blue' }])

        expect(table.rows).toHaveLength(5)
        expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
        expect(table.rows[1]).toEqual({ shape: 'circle', color: 'green' })
        expect(table.rows[2]).toEqual({ shape: 'square', color: 'red' })
        expect(table.rows[3]).toEqual({ shape: 'square', color: 'green' })
        expect(table.rows[4]).toEqual({ shape: 'triangle', color: 'blue' })
      })
    })

    describe('repeat functionality', () => {
      it('should throw error if repeat is called before new', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.repeat(3)
        }).toThrow('repeat() must be called after new()')
      })

      it('should repeat trials n times', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = [
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
        ]

        const table = stepper.new().append(trials).repeat(3)

        expect(table.rows).toHaveLength(6)
        expect(table.rows).toEqual([
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
        ])
      })

      it('should handle empty table', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new().repeat(10)
        expect(table.rows).toHaveLength(0)
      })

      it('should handle n <= 0', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = [
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
        ]

        const table = stepper.new().append(trials).repeat(0)
        expect(table.rows).toHaveLength(2)
        expect(table.rows).toEqual(trials)

        const table2 = stepper.new().append(trials).repeat(-1)
        expect(table2.rows).toHaveLength(2)
        expect(table2.rows).toEqual(trials)
      })

      it('should be chainable with other methods', async () => {
        const stepper = getCurrentRouteStepper()
        const trials = [
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
        ]

        const table = stepper
          .new()
          .append(trials)
          .repeat(2)
          .append([{ color: 'green', shape: 'circle' }])

        expect(table.rows).toHaveLength(5)
        expect(table.rows).toEqual([
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
          { color: 'green', shape: 'circle' },
        ])
      })
    })

    describe('shuffle functionality', () => {
      it('should throw error if shuffle is called before new', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.shuffle()
        }).toThrow('shuffle() must be called after new()')
      })

      it('should shuffle rows with a specific seed', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
          { id: 5, value: 'e' },
        ])

        // Shuffle with a specific seed
        table.shuffle('test-seed-123')

        // The order should be deterministic with this seed
        // This order was determined by running the test with this seed
        expect(table.rows.map((r) => r.id)).toEqual([3, 1, 5, 2, 4])
      })

      it('should produce consistent order with same seed', async () => {
        const stepper = getCurrentRouteStepper()
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
          { id: 5, value: 'e' },
        ]

        // Create two tables with same data
        const table1 = stepper.new().append(data)
        const table2 = stepper.new().append(data)

        // Shuffle both with same seed
        table1.shuffle('test-seed-123')
        table2.shuffle('test-seed-123')

        // They should have the same order
        expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
      })

      it('should use global seeded RNG when no seed is provided', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
          { id: 5, value: 'e' },
        ])

        // Set up global seed
        seedrandom('global-test-seed', { global: true })

        // Shuffle without a seed
        table.shuffle()

        // The order should be deterministic with the global seed
        // This order was determined by running the test with this global seed
        expect(table.rows.map((r) => r.id)).toEqual([5, 2, 4, 1, 3])
      })

      it('should preserve all elements after shuffling', async () => {
        const stepper = getCurrentRouteStepper()
        const originalData = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
          { id: 5, value: 'e' },
        ]

        const table = stepper.new().append(originalData)
        const originalIds = [...table.rows.map((r) => r.id)].sort()

        // Shuffle with a specific seed
        table.shuffle('test-seed-123')
        const shuffledIds = [...table.rows.map((r) => r.id)].sort()

        // All elements should still be present, just in different order
        expect(shuffledIds).toEqual(originalIds)
      })

      it('should handle empty table', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new()
        table.shuffle('test-seed-123')
        expect(table.rows).toEqual([])
      })

      it('should handle single element table', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new().append([{ id: 1, value: 'a' }])
        table.shuffle('test-seed-123')
        expect(table.rows).toEqual([{ id: 1, value: 'a' }])
      })

      it('should be chainable with other methods', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper
          .new()
          .append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
          ])
          .shuffle('test-seed-123')
          .append([{ id: 4, value: 'd' }])

        expect(table.rows).toHaveLength(4)
        expect(table.rows[3]).toEqual({ id: 4, value: 'd' })
      })
    })

    describe('sample functionality', () => {
      it('should throw error if sample is called before new', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.sample()
        }).toThrow('sample() must be called after new()')
      })

      it('should handle empty table', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new()
        table.sample({ type: 'without-replacement', size: 5 })
        expect(table.rows).toEqual([])
      })

      describe('with-replacement sampling', () => {
        it('should require size parameter', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'with-replacement' })
          }).toThrow('size parameter is required for with-replacement sampling')
        })

        it('should sample with replacement', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
          ]

          const table = stepper.new().append(data)
          table.sample({ type: 'with-replacement', size: 5 })

          expect(table.rows).toHaveLength(5)
          // Check that all sampled items are from the original data
          table.rows.forEach((row) => {
            expect(data).toContainEqual(row)
          })
        })

        it('should produce consistent results with same seed', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
          ]

          // Create two tables with same data
          const table1 = stepper.new().append(data)
          const table2 = stepper.new().append(data)

          // Sample both with same seed
          table1.sample({ type: 'with-replacement', size: 5, seed: 'test-seed-123' })
          table2.sample({ type: 'with-replacement', size: 5, seed: 'test-seed-123' })

          // They should have the same order
          expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
        })

        it('should handle weighted sampling', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
          ]

          const table = stepper.new().append(data)
          table.sample({
            type: 'with-replacement',
            size: 1000,
            weights: [0.5, 0.3, 0.2],
            seed: 'test-seed-123',
          })

          // Count occurrences
          const counts = table.rows.reduce((acc, row) => {
            acc[row.id] = (acc[row.id] || 0) + 1
            return acc
          }, {})

          // With these weights, we expect roughly:
          // id 1: ~500 occurrences
          // id 2: ~300 occurrences
          // id 3: ~200 occurrences
          expect(counts[1]).toBeGreaterThan(450)
          expect(counts[1]).toBeLessThan(550)
          expect(counts[2]).toBeGreaterThan(250)
          expect(counts[2]).toBeLessThan(350)
          expect(counts[3]).toBeGreaterThan(150)
          expect(counts[3]).toBeLessThan(250)
        })

        it('should throw error when weights length does not match table length', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
          ]

          const table = stepper.new().append(data)

          // Test with too few weights
          expect(() => {
            table.sample({
              type: 'with-replacement',
              size: 5,
              weights: [0.5, 0.3], // Only 2 weights for 3 items
              seed: 'test-seed-123',
            })
          }).toThrow('Weights array length must match the number of trials')

          // Test with too many weights
          expect(() => {
            table.sample({
              type: 'with-replacement',
              size: 5,
              weights: [0.5, 0.3, 0.2, 0.1], // 4 weights for 3 items
              seed: 'test-seed-123',
            })
          }).toThrow('Weights array length must match the number of trials')
        })
      })

      describe('without-replacement sampling', () => {
        it('should require size parameter', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'without-replacement' })
          }).toThrow('size parameter is required for without-replacement sampling')
        })

        it('should not allow size larger than available trials', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'without-replacement', size: 3 })
          }).toThrow('Sample size cannot be larger than the number of available trials')
        })

        it('should sample without replacement', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
            { id: 4, value: 'd' },
          ]

          const table = stepper.new().append(data)
          table.sample({ type: 'without-replacement', size: 2 })

          expect(table.rows).toHaveLength(2)
          // Check that no item appears twice
          const ids = table.rows.map((r) => r.id)
          expect(new Set(ids).size).toBe(2)
          // Check that all sampled items are from the original data
          table.rows.forEach((row) => {
            expect(data).toContainEqual(row)
          })
        })

        it('should produce consistent results with same seed', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
            { id: 4, value: 'd' },
          ]

          // Create two tables with same data
          const table1 = stepper.new().append(data)
          const table2 = stepper.new().append(data)

          // Sample both with same seed
          table1.sample({ type: 'without-replacement', size: 2, seed: 'test-seed-123' })
          table2.sample({ type: 'without-replacement', size: 2, seed: 'test-seed-123' })

          // They should have the same order
          expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
        })
      })

      describe('fixed-repetitions sampling', () => {
        it('should require size parameter', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'fixed-repetitions' })
          }).toThrow('size parameter is required for fixed-repetitions sampling')
        })

        it('should repeat each trial size times', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ]

          const table = stepper.new().append(data)
          table.sample({ type: 'fixed-repetitions', size: 3 })

          expect(table.rows).toHaveLength(6) // 2 trials * 3 repetitions
          // Count occurrences of each trial
          const counts = table.rows.reduce((acc, row) => {
            acc[row.id] = (acc[row.id] || 0) + 1
            return acc
          }, {})
          expect(counts[1]).toBe(3)
          expect(counts[2]).toBe(3)
        })

        it('should shuffle the result', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ]

          const table = stepper.new().append(data)
          table.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })

          // The order should be different from the original
          expect(table.rows.map((r) => r.id)).not.toEqual([1, 1, 1, 2, 2, 2])
        })

        it('should produce consistent results with same seed', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ]

          // Create two tables with same data
          const table1 = stepper.new().append(data)
          const table2 = stepper.new().append(data)

          // Sample both with same seed
          table1.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })
          table2.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })

          // They should have the same order
          expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
        })
      })

      describe('alternate-groups sampling', () => {
        it('should require groups parameter', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'alternate-groups' })
          }).toThrow('groups parameter is required for alternate-groups sampling')
        })

        it('should require at least two groups', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'alternate-groups', groups: [[0]] })
          }).toThrow('groups must be an array with at least two groups')
        })

        it('should alternate between groups', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
            { id: 4, value: 'd' },
          ]

          const table = stepper.new().append(data)
          table.sample({
            type: 'alternate-groups',
            groups: [
              [0, 2],
              [1, 3],
            ], // Group 1: [a, c], Group 2: [b, d]
          })

          // Should alternate between groups: [a, b, c, d]
          expect(table.rows.map((r) => r.id)).toEqual([1, 2, 3, 4])
        })

        it('should handle groups of different sizes', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
            { id: 4, value: 'd' },
            { id: 5, value: 'e' },
          ]

          const table = stepper.new().append(data)
          table.sample({
            type: 'alternate-groups',
            groups: [
              [0, 1],
              [2, 3, 4],
            ], // Group 1: [a, b], Group 2: [c, d, e]
          })

          // Should alternate between groups until shortest group is exhausted
          // and then continue with remaining elements from longer group
          expect(table.rows.map((r) => r.id)).toEqual([1, 3, 2, 4, 5])
        })

        it('should randomize group order when requested', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
            { id: 4, value: 'd' },
          ]

          const table = stepper.new().append(data)
          table.sample({
            type: 'alternate-groups',
            groups: [
              [0, 2],
              [1, 3],
            ],
            randomize_group_order: true,
            seed: 'test-seed-123',
          })

          // The order should be different from the default
          // With this seed, the groups should be in reverse order
          expect(table.rows.map((r) => r.id)).toEqual([2, 4, 1, 3])
        })

        it('should produce consistent results with same seed', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
            { id: 4, value: 'd' },
          ]

          // Create two tables with same data
          const table1 = stepper.new().append(data)
          const table2 = stepper.new().append(data)

          // Sample both with same seed
          table1.sample({
            type: 'alternate-groups',
            groups: [
              [0, 2],
              [1, 3],
            ],
            randomize_group_order: true,
            seed: 'test-seed-123',
          })
          table2.sample({
            type: 'alternate-groups',
            groups: [
              [0, 2],
              [1, 3],
            ],
            randomize_group_order: true,
            seed: 'test-seed-123',
          })

          // They should have the same order
          expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
        })

        it('should validate group indices', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({
              type: 'alternate-groups',
              groups: [[0, 2], [1]], // Invalid index 2
            })
          }).toThrow('Invalid index 2 in group 0')
        })
      })

      describe('custom sampling', () => {
        it('should require fn parameter', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'custom' })
          }).toThrow('fn parameter is required for custom sampling')
        })

        it('should require fn to be a function', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({ type: 'custom', fn: 'not a function' })
          }).toThrow('fn must be a function')
        })

        it('should use custom sampling function', async () => {
          const stepper = getCurrentRouteStepper()
          const data = [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
            { id: 3, value: 'c' },
          ]

          const table = stepper.new().append(data)
          table.sample({
            type: 'custom',
            fn: (indices) => indices.reverse(), // Reverse the order
          })

          expect(table.rows.map((r) => r.id)).toEqual([3, 2, 1])
        })

        it('should validate custom function output', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({
              type: 'custom',
              fn: () => 'not an array',
            })
          }).toThrow('Custom sampling function must return an array')
        })

        it('should validate custom function indices', async () => {
          const stepper = getCurrentRouteStepper()
          const table = stepper.new().append([
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ])

          expect(() => {
            table.sample({
              type: 'custom',
              fn: () => [2], // Invalid index
            })
          }).toThrow('Invalid index 2 returned by custom sampling function')
        })
      })

      it('should throw error for invalid sampling type', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table.sample({ type: 'invalid-type' })
        }).toThrow('Invalid sampling type: invalid-type')
      })

      it('should throw error when exceeding safety limit', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table.sample({
            type: 'with-replacement',
            size: config.max_stepper_rows + 1,
          })
        }).toThrow(/sample\(\) would generate \d+ rows, which exceeds the safety limit/)
      })
    })
  })
})
