/* eslint-disable no-undef */
// general testing functions
import { defineComponent, h } from 'vue'
//import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { describe, it, expect, beforeEach, vi } from 'vitest'

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
      expect(table.outer).toBeInstanceOf(Function)
      expect(table.delete).toBeInstanceOf(Function)
      expect(table.length).toBeDefined()
      expect(table.indexOf).toBeInstanceOf(Function)
      expect(table.slice).toBeInstanceOf(Function)
      expect(table[Symbol.iterator]).toBeInstanceOf(Function)
      expect(table[Symbol.isConcatSpreadable]).toBeDefined()
    })

    it('should throw errors if chain methods are called before new()', async () => {
      const stepper = getCurrentRouteStepper()

      // Test all chainable methods
      const methods = ['append', 'shuffle', 'sample', 'repeat', 'push', 'forEach', 'zip', 'outer', 'delete']

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

    it('should throw error when append would exceed safety limit', async () => {
      const stepper = getCurrentRouteStepper()

      // Create an array that would exceed the limit when appended
      const largeArray = Array(config.max_stepper_rows + 1).fill({ color: 'red', shape: 'circle' })

      expect(() => {
        stepper.new().append(largeArray)
      }).toThrow(/append\(\) would generate \d+ rows, which exceeds the safety limit of \d+/)
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

    describe('delete functionality', () => {
      it('should throw error if delete() is called before new()', async () => {
        const stepper = getCurrentRouteStepper()
        expect(() => {
          stepper.delete()
        }).toThrow('delete() must be called after new()')
      })

      it('should delete the table and end the chain', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new()

        // Add some data to the table
        table.append([
          { color: 'red', shape: 'triangle' },
          { color: 'blue', shape: 'square' },
        ])

        // Delete should not return this for chaining
        const result = table.delete()
        expect(result).toBeUndefined()
      })

      it('should prevent using table methods after deletion', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new()

        // Add some data and delete
        table.append([{ color: 'red', shape: 'triangle' }]).delete()

        // Test all chainable methods throw after deletion
        const methods = ['append', 'shuffle', 'sample', 'repeat', 'push', 'forEach', 'zip', 'outer']

        methods.forEach((method) => {
          expect(() => {
            table[method]()
          }).toThrow('Table has been deleted')
        })

        // Test array-like access throws after deletion
        expect(() => table.length).toThrow('Table has been deleted')
        expect(() => table.rows).toThrow('Table has been deleted')
        expect(() => table[0]).toThrow('Table has been deleted')
        expect(() => [...table]).toThrow('Table has been deleted')
        expect(() => table.slice()).toThrow('Table has been deleted')
        expect(() => table.indexOf({})).toThrow('Table has been deleted')
      })

      it('should throw error when trying to delete an already deleted table', async () => {
        const stepper = getCurrentRouteStepper()
        const table = stepper.new()

        table.delete()
        expect(() => {
          table.delete()
        }).toThrow('Table has been deleted')
      })
    })
  })
})
