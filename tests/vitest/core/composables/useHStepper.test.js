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
import { NestedTable } from '@/core/composables/NestedTable'

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

  describe.skip('basic interactive checks', () => {
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
      expect(stepper.index).toBeDefined()
      expect(stepper.current).toBeDefined()
      expect(stepper.sm).toBeInstanceOf(StepperStateMachine)
    })

    it('should create a StepperStateMachine instance', async () => {
      const stepper = getCurrentRouteStepper()
      expect(stepper.sm).toBeInstanceOf(StepperStateMachine)
    })

    it('should provide the table() method', async () => {
      const stepper = getCurrentRouteStepper()
      expect(stepper.table).toBeInstanceOf(Function)
    })

    it('should provide the table API after table()', async () => {
      const stepper = getCurrentRouteStepper()
      const t1 = stepper.table()

      expect(t1).toBeDefined()
      expect(t1.rows).toBeDefined()
      expect(Array.isArray(t1.rows)).toBe(true)
      expect(t1.append).toBeInstanceOf(Function)
      expect(t1.shuffle).toBeInstanceOf(Function)
      expect(t1.sample).toBeInstanceOf(Function)
      expect(t1.repeat).toBeInstanceOf(Function)
      expect(t1.push).toBeInstanceOf(Function)
      expect(t1.forEach).toBeInstanceOf(Function)
      expect(t1.zip).toBeInstanceOf(Function)
      expect(t1.range).toBeInstanceOf(Function)
      expect(t1.outer).toBeInstanceOf(Function)
      expect(t1.print).toBeInstanceOf(Function)
      expect(t1.length).toBeDefined()
      expect(t1.indexOf).toBeInstanceOf(Function)
      expect(t1.slice).toBeInstanceOf(Function)
      expect(t1[Symbol.iterator]).toBeInstanceOf(Function)
      expect(t1[Symbol.isConcatSpreadable]).toBeDefined()

      // Test nested table creation
      t1.range(10)
      expect(t1[0].table).toBeInstanceOf(Function)
    })

    it('should throw errors if chain methods are called before table()', async () => {
      const stepper = getCurrentRouteStepper()

      // Test all chainable methods
      const methods = [
        'append',
        'shuffle',
        'sample',
        'repeat',
        'push',
        'forEach',
        'zip',
        'outer',
        'range',
        'print',
        'map',
        'slice',
        'head',
        'tail',
        'partition',
        'indexOf',
      ]

      methods.forEach((method) => {
        expect(() => {
          stepper[method]()
        }).toThrow(`${method}() must be called after table()`)
      })
    })
  })

  // since NestedTable.test.js exists most of the core table functions should be
  // tested elsewhere.  Here we just test that the methods are available and that
  // the table is created correctly.
  describe('basic table operations', () => {
    it('should create a table with the range method', async () => {
      const stepper = getCurrentRouteStepper()
      const table = stepper.table().range(10)
      expect(table).toBeInstanceOf(Object)
      expect(table.length).toBe(10) // preferred way to access
      expect(table.rows).toBeInstanceOf(Array)
      expect(table.rows).toHaveLength(10)
      for (let i = 0; i < 10; i++) {
        expect(table[i]).toEqual({ range: i })
      }
    })

    it('should create a nested table', async () => {
      const stepper = getCurrentRouteStepper()
      const table = stepper
        .table()
        .range(10)
        .map((row, i) => {
          row.table().range(10)
        })
      expect(table).toBeInstanceOf(Object)
      expect(table.length).toBe(10) // preferred way to access
      expect(table.rows).toBeInstanceOf(Array)
      expect(table.rows).toHaveLength(10)
      for (let i = 0; i < 10; i++) {
        expect(table[i]).toEqual({ range: i })
        for (let j = 0; j < 10; j++) {
          expect(table[i][j]).toEqual({ range: j })
        }
      }
    })
  })

  // the first few tests here should verify that the structure from variables table calls
  // are reflected in the state machine.
  // they then should verify that navigation works as expected
  describe('table push() method', () => {
    it('should push a row to the statemachine', async () => {
      const stepper = getCurrentRouteStepper()
      const table = stepper.table().append({ hi: 'there' }).push()
      expect(table.length).toBe(1)
      expect(table[0]).toEqual({ hi: 'there' })
    })

    it('should push a table to the state machine and handle stepping correctly', async () => {
      const stepper = getCurrentRouteStepper()
      const table = stepper.table().range(10)

      // Store original table values for comparison
      const tableValues = table.rows.map((row, i) => [{ range: i }])

      // Push table to state machine
      table.push()
      stepper.reset()

      // Verify initial state - should be at first item
      expect(stepper.current).toEqual(tableValues[0])
      expect(stepper.index).toEqual('0')
      expect(stepper.sm.stepState.currentIndex).toBe(0)
      expect(stepper.sm.getData()).toEqual(tableValues[0])

      // Step through remaining trials and verify values match
      for (let i = 1; i < 10; i++) {
        const nextValue = stepper.next()
        expect(nextValue).toBe(i)
        expect(stepper.current).toEqual(tableValues[i])
        expect(stepper.index).toEqual(i.toString())
        expect(stepper.sm.stepState.currentIndex).toBe(i)
        expect(stepper.sm.getData()).toEqual(tableValues[i])
      }

      // Verify we're at the end
      expect(stepper.next()).toBeNull()

      // Step backwards and verify values
      for (let i = 8; i >= 0; i--) {
        const prevValue = stepper.prev()
        expect(prevValue).toBe(i)
        expect(stepper.current).toEqual(tableValues[i])
        expect(stepper.index).toEqual(i.toString())
        expect(stepper.sm.stepState.currentIndex).toBe(i)
        expect(stepper.sm.getData()).toEqual(tableValues[i])
      }

      // Test reset - should go back to first item
      stepper.reset()
      expect(stepper.current).toEqual(tableValues[0])
      expect(stepper.index).toEqual('0')
      expect(stepper.sm.stepState.currentIndex).toBe(0)
      expect(stepper.sm.getData()).toEqual(tableValues[0])

      // Verify we can step forward again after reset
      const nextValue = stepper.next()
      expect(nextValue).toBe(1)
      expect(stepper.current).toEqual(tableValues[1])
      expect(stepper.index).toEqual('1')
      expect(stepper.sm.stepState.currentIndex).toBe(1)
      expect(stepper.sm.getData()).toEqual(tableValues[1])
    })

    it('should require push() to be the final operation in the chain', async () => {
      const stepper = getCurrentRouteStepper()
      const table = stepper.table().range(10)

      // Store original table values for comparison
      const tableValues = table.rows.map((row, i) => [{ range: i }])

      // Push table to state machine
      table.push()

      // Verify initial state - should be at first item
      expect(stepper.current).toEqual(tableValues[0])
      expect(stepper.index).toEqual('0')
      expect(stepper.sm.stepState.currentIndex).toBe(0)
      expect(stepper.sm.getData()).toEqual(tableValues[0])

      // Step through remaining trials and verify values match
      for (let i = 1; i < 10; i++) {
        const nextValue = stepper.next()
        expect(nextValue).toBe(i)
        expect(stepper.current).toEqual(tableValues[i])
        expect(stepper.index).toEqual(i.toString())
        expect(stepper.sm.stepState.currentIndex).toBe(i)
        expect(stepper.sm.getData()).toEqual(tableValues[i])
      }

      // Verify we're at the end
      expect(stepper.next()).toBeNull()

      // Step backwards and verify values
      for (let i = 8; i >= 0; i--) {
        const prevValue = stepper.prev()
        expect(prevValue).toBe(i)
        expect(stepper.current).toEqual(tableValues[i])
        expect(stepper.index).toEqual(i.toString())
        expect(stepper.sm.stepState.currentIndex).toBe(i)
        expect(stepper.sm.getData()).toEqual(tableValues[i])
      }

      // Test reset - should go back to first item
      stepper.reset()
      expect(stepper.current).toEqual(tableValues[0])
      expect(stepper.index).toEqual('0')
      expect(stepper.sm.stepState.currentIndex).toBe(0)
      expect(stepper.sm.getData()).toEqual(tableValues[0])

      // Verify we can step forward again after reset
      const nextValue = stepper.next()
      expect(nextValue).toBe(1)
      expect(stepper.current).toEqual(tableValues[1])
      expect(stepper.index).toEqual('1')
      expect(stepper.sm.stepState.currentIndex).toBe(1)
      expect(stepper.sm.getData()).toEqual(tableValues[1])
    })

    it('should handle basic navigation as shown in documentation', async () => {
      const stepper = getCurrentRouteStepper()

      // Create and push some trials
      stepper
        .table()
        .append([
          { shape: 'circle', color: 'red' },
          { shape: 'square', color: 'blue' },
        ])
        .push()

      // After push(), we're at the first trial
      expect(stepper.current).toEqual([{ shape: 'circle', color: 'red' }])
      expect(stepper.index).toBe('0')

      // Move to next trial
      stepper.next()
      expect(stepper.current).toEqual([{ shape: 'square', color: 'blue' }])
      expect(stepper.index).toBe('1')

      // Go back
      stepper.prev()
      expect(stepper.current).toEqual([{ shape: 'circle', color: 'red' }])
      expect(stepper.index).toBe('0')

      // Reset always goes to the first trial
      stepper.reset()
      expect(stepper.current).toEqual([{ shape: 'circle', color: 'red' }])
      expect(stepper.index).toBe('0')
    })

    it('should handle nested tables as well', async () => {
      const stepper = getCurrentRouteStepper()

      // Create a nested table using map
      const trials = stepper
        .table()
        .range(2) // Create 2 parent trials
        .map((row, i) => {
          row.append({ phase: 'parent', id: i }) // Add data to parent
          row.table().append([
            { type: 'stim', index: 0 },
            { type: 'feedback', index: 1 },
            { type: 'rest', index: 2 },
          ]) // Each parent has 3 nested trials
        })
      trials.print()
      trials.push()

      console.log(stepper.sm.getTreeDiagram())
      // Verify initial state - should be at first child item
      expect(stepper.index).toBe('0-0')
      expect(stepper.current).toEqual([
        { range: 0, phase: 'parent', id: 0 },
        { type: 'stim', index: 0 },
      ])

      // Move to second nested trial of first parent
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 0, phase: 'parent', id: 0 },
        { type: 'feedback', index: 1 },
      ])
      expect(stepper.index).toBe('0-1')

      // Move to third nested trial of first parent
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 0, phase: 'parent', id: 0 },
        { type: 'rest', index: 2 },
      ])
      expect(stepper.index).toBe('0-2')

      // Move to first nested trial of second parent
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 1, phase: 'parent', id: 1 },
        { type: 'stim', index: 0 },
      ])
      expect(stepper.index).toBe('1-0')

      // Move to second nested trial of second parent
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 1, phase: 'parent', id: 1 },
        { type: 'feedback', index: 1 },
      ])
      expect(stepper.index).toBe('1-1')

      // Move to third nested trial of second parent
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 1, phase: 'parent', id: 1 },
        { type: 'rest', index: 2 },
      ])
      expect(stepper.index).toBe('1-2')

      // Verify we're at the end
      expect(stepper.next()).toBeNull()

      // Test going backwards
      stepper.prev()
      expect(stepper.current).toEqual([
        { range: 1, phase: 'parent', id: 1 },
        { type: 'feedback', index: 1 },
      ])
      expect(stepper.index).toBe('1-1')

      // Reset should go back to first parent's first trial
      stepper.reset()
      expect(stepper.current).toEqual([
        { range: 0, phase: 'parent', id: 0 },
        { type: 'stim', index: 0 },
      ])
      expect(stepper.index).toBe('0-0')
    })

    it('should handle nodes with empty data objects', async () => {
      const stepper = getCurrentRouteStepper()

      // Create a table with empty objects and undefined/null data
      const trials = stepper
        .table()
        .append([
          {}, // Empty object
          { data: null }, // Object with null
          { data: undefined }, // Object with undefined
          { data: {} }, // Object with empty nested object
        ])
        .push()

      // Verify initial state
      expect(stepper.current).toEqual([{}])
      expect(stepper.index).toBe('0')

      // Navigate through all states
      stepper.next()
      expect(stepper.current).toEqual([{ data: null }])
      expect(stepper.index).toBe('1')

      stepper.next()
      expect(stepper.current).toEqual([{ data: undefined }])
      expect(stepper.index).toBe('2')

      stepper.next()
      expect(stepper.current).toEqual([{ data: {} }])
      expect(stepper.index).toBe('3')
    })

    it('should handle nodes with missing data in the path', async () => {
      const stepper = getCurrentRouteStepper()

      // Create a nested structure where some nodes have no data
      const trials = stepper
        .table()
        .range(2) // Creates parent nodes with only range data
        .map((row, i) => {
          // First parent gets no additional data, second gets data
          if (i === 1) {
            row.append({ phase: 'parent' })
          }

          // Create nested trials with some missing data
          row.table().append([
            { type: 'stim' }, // Has data
            {}, // No data
            { type: 'feedback' }, // Has data
          ])
        })
        .push()

      // Check first parent (only range data) with first child
      expect(stepper.current).toEqual([{ range: 0 }, { type: 'stim' }])
      expect(stepper.index).toBe('0-0')

      // Move to empty data child
      stepper.next()
      expect(stepper.current).toEqual([{ range: 0 }, {}])
      expect(stepper.index).toBe('0-1')

      // Move to second parent (has additional data) with first child
      stepper.next()
      stepper.next()
      expect(stepper.current).toEqual([{ range: 1, phase: 'parent' }, { type: 'stim' }])
      expect(stepper.index).toBe('1-0')
    })

    it('should support sequential row addition through multiple pushes', async () => {
      const stepper = getCurrentRouteStepper()

      // First push: Add practice trials
      stepper
        .table()
        .append([
          { type: 'practice', id: 1 },
          { type: 'practice', id: 2 },
        ])
        .push()

      // Verify initial state
      expect(stepper.current).toEqual([{ type: 'practice', id: 1 }])
      expect(stepper.index).toBe('0')

      // Second push: Add main trials
      stepper
        .table()
        .append([
          { type: 'main', id: 3 },
          { type: 'main', id: 4 },
        ])
        .push()

      // Verify we can navigate through all trials in sequence
      expect(stepper.current).toEqual([{ type: 'practice', id: 1 }])
      expect(stepper.index).toBe('0')

      stepper.next()
      expect(stepper.current).toEqual([{ type: 'practice', id: 2 }])
      expect(stepper.index).toBe('1')

      stepper.next()
      expect(stepper.current).toEqual([{ type: 'main', id: 3 }])
      expect(stepper.index).toBe('2')

      stepper.next()
      expect(stepper.current).toEqual([{ type: 'main', id: 4 }])
      expect(stepper.index).toBe('3')

      // Verify we're at the end
      expect(stepper.next()).toBeNull()

      // Test going backwards
      stepper.prev()
      expect(stepper.current).toEqual([{ type: 'main', id: 3 }])
      expect(stepper.index).toBe('2')

      stepper.prev()
      expect(stepper.current).toEqual([{ type: 'practice', id: 2 }])
      expect(stepper.index).toBe('1')

      stepper.prev()
      expect(stepper.current).toEqual([{ type: 'practice', id: 1 }])
      expect(stepper.index).toBe('0')

      // Verify we're at the beginning
      expect(stepper.prev()).toBeNull()

      // Test reset
      stepper.reset()
      expect(stepper.current).toEqual([{ type: 'practice', id: 1 }])
      expect(stepper.index).toBe('0')
    })

    it('should handle deep nesting (3+ levels)', async () => {
      const stepper = getCurrentRouteStepper()

      // Create a deeply nested structure
      const trials = stepper
        .table()
        .range(2)
        .map((block, blockId) => {
          block.append({ type: 'block', id: blockId })

          // Level 2: Create trials within blocks
          block
            .table()
            .range(2)
            .map((trial, trialId) => {
              trial.append({ type: 'trial', id: trialId })

              // Level 3: Create phases within trials
              trial.table().append([
                { type: 'stimulus', phase: 1 },
                { type: 'response', phase: 2 },
              ])
            })
        })
        .push()

      // Verify initial state (first block, first trial, first phase)
      expect(stepper.current).toEqual([
        { range: 0, type: 'block', id: 0 },
        { range: 0, type: 'trial', id: 0 },
        { type: 'stimulus', phase: 1 },
      ])
      expect(stepper.index).toBe('0-0-0')

      // Navigate through the structure
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 0, type: 'block', id: 0 },
        { range: 0, type: 'trial', id: 0 },
        { type: 'response', phase: 2 },
      ])
      expect(stepper.index).toBe('0-0-1')

      // Move to next trial's first phase
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 0, type: 'block', id: 0 },
        { range: 1, type: 'trial', id: 1 },
        { type: 'stimulus', phase: 1 },
      ])
      expect(stepper.index).toBe('0-1-0')

      // Move to next block
      stepper.next()
      stepper.next()
      expect(stepper.current).toEqual([
        { range: 1, type: 'block', id: 1 },
        { range: 0, type: 'trial', id: 0 },
        { type: 'stimulus', phase: 1 },
      ])
      expect(stepper.index).toBe('1-0-0')
    })

    it('should handle error cases and invalid paths', async () => {
      const stepper = getCurrentRouteStepper()

      // Create a simple nested structure
      const trials = stepper
        .table()
        .range(2)
        .map((row, i) => {
          row.append({ phase: 'parent', id: i })
          row.table().append([{ type: 'stim' }, { type: 'feedback' }])
        })
        .push()

      // Test accessing invalid indices
      expect(stepper.sm[999]).toBeUndefined()
      expect(stepper.sm['nonexistent']).toBeUndefined()

      // Test navigating beyond bounds
      stepper.reset()
      for (let i = 0; i < 10; i++) {
        stepper.next() // Should eventually reach end without error
      }
      expect(stepper.next()).toBeNull() // Should handle going past end gracefully

      // Test navigating backwards beyond start
      stepper.reset()
      expect(stepper.prev()).toBeNull() // Should handle going before start gracefully

      // Test resetting at various positions
      stepper.next()
      stepper.next()
      stepper.reset()
      expect(stepper.current).toEqual([{ range: 0, phase: 'parent', id: 0 }, { type: 'stim' }])
      expect(stepper.index).toBe('0-0')
    })
  })

  // describe.skip('complex tests', () => {
  //   it('should handle nesting after shuffling', async () => {
  //     const stepper = getCurrentRouteStepper()
  //     const trials = stepper.table().range(10).shuffle()
  //     const nestedTable = trials[0].table().range(3)
  //     expect(nestedTable.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable.rows[i]).toEqual({ range: i })
  //     }
  //   })

  //   it('should handle nesting after sampling', async () => {
  //     const stepper = getCurrentRouteStepper()
  //     const trials = stepper.table().range(10)
  //     trials.sample({
  //       type: 'with-replacement',
  //       size: 3,
  //     })
  //     const nestedTable = trials[0].table().range(3)
  //     expect(nestedTable.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable.rows[i]).toEqual({ range: i })
  //     }
  //   })

  //   it('should handle shuffling at the top level after a nested table created', async () => {
  //     const stepper = getCurrentRouteStepper()
  //     const trials = stepper.table().range(10)
  //     const nestedTable = trials[3].table().range(3)
  //     trials.shuffle()
  //     expect(nestedTable.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable.rows[i]).toEqual({ range: i })
  //     }
  //   })

  //   it('should raise an error when modifying dimensionality of a table with nested tables', async () => {
  //     const stepper = getCurrentRouteStepper()
  //     const trials = stepper.table().range(10)
  //     const nestedTable = trials[3].table().range(3)

  //     // Test sample()
  //     expect(() => {
  //       trials.sample({
  //         type: 'with-replacement',
  //         size: 1,
  //       })
  //     }).toThrow('Cannot sample a table that has nested tables')

  //     // Test head()
  //     expect(() => {
  //       trials.head(5)
  //     }).toThrow('Cannot take head of a table that has nested tables')

  //     // Test tail()
  //     expect(() => {
  //       trials.tail(5)
  //     }).toThrow('Cannot take tail of a table that has nested tables')

  //     // Test slice()
  //     expect(() => {
  //       trials.slice(0, 5)
  //     }).toThrow('Cannot slice a table that has nested tables')

  //     // Verify the nested table is still intact
  //     expect(nestedTable.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable.rows[i]).toEqual({ range: i })
  //     }
  //   })

  //   it('should copy the nested table when repeating', async () => {
  //     const stepper = getCurrentRouteStepper()
  //     const trials = stepper.table().range(10)
  //     const nestedTable = trials[3].table().range(3)
  //     trials.repeat(2)

  //     // Verify that the original nested table is still in place
  //     expect(trials[3][Symbol.for('table')]).toBe(nestedTable)

  //     // Verify that the repeated row has a different nested table instance
  //     expect(trials[13][Symbol.for('table')]).not.toBe(nestedTable)

  //     // Verify that the repeated nested table has the same data
  //     expect(trials[13][Symbol.for('table')].rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(trials[13][Symbol.for('table')].rows[i]).toEqual({ range: i })
  //     }

  //     // Verify that modifying the repeated nested table doesn't affect the original
  //     trials[13][Symbol.for('table')].rows[0].value = 'modified'
  //     expect(trials[3][Symbol.for('table')].rows[0].value).toBeUndefined()
  //   })

  //   it('should allow creating nested tables with repeat and forEach', async () => {
  //     const stepper = getCurrentRouteStepper()
  //     const trials = stepper.table().range(10) // allocate 10 units
  //     expect(trials[0].length).toBe(1)
  //     trials.forEach((row, i) => {
  //       row.append({ trial: i })
  //       row.table().append([
  //         { type: 'stim', index: i },
  //         { type: 'feedback', index: i },
  //       ])
  //     })
  //     trials.shuffle('1234')
  //     trials.print()

  //     expect(trials[0].length).toBe(1)
  //     expect(Object.keys(trials[0]).length).toBe(2)

  //     // verify that shuffle worked
  //     expect(trials[0].trial).not.toBe(0) // low probability of being in sequential order esp with this seed

  //     // After shuffling, the trial property should still exist but will be in a different order
  //     const trialValues = trials.rows.map((row) => row.trial).sort()
  //     expect(trialValues).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

  //     // Each row should still have its nested table with the correct index
  //     trials.rows.forEach((row) => {
  //       const nestedTable = row[Symbol.for('table')]
  //       expect(nestedTable).toBeDefined()
  //       expect(nestedTable.rows).toHaveLength(2)
  //       expect(nestedTable.rows[0].index).toBe(row.trial)
  //       expect(nestedTable.rows[1].index).toBe(row.trial)
  //     })
  //   })
  // })

  // describe.skip('stepper state machine integration', () => {
  //   let smilestore

  //   beforeEach(async () => {
  //     // Reset mock state
  //     vi.clearAllMocks()

  //     // Create a fresh router for each test
  //     router = createRouter({
  //       history: createWebHashHistory(),
  //       routes,
  //     })

  //     // Create pinia instance and set it as active
  //     const pinia = createTestingPinia({
  //       stubActions: false,
  //       createSpy: vi.fn,
  //     })
  //     setActivePinia(pinia)

  //     // Mount the test component
  //     wrapper = mount(TestComponent, {
  //       global: {
  //         plugins: [pinia, router],
  //         stubs: {
  //           RouterLink: true,
  //         },
  //       },
  //     })

  //     // Navigate to the first route and wait for it to be ready
  //     await router.push('/')
  //     await router.isReady()
  //     await flushPromises()

  //     // Get API and smilestore instances
  //     api = getCurrentRouteAPI()
  //     smilestore = useSmileStore()

  //     // Ensure page tracker is registered for the current route
  //     const currentRoute = router.currentRoute.value
  //     smilestore.registerPageTracker(currentRoute.name)
  //   })

  //   it('should correctly build and push trials to state machine', async () => {
  //     const stepper = getCurrentRouteStepper()

  //     // Build a simple trial structure
  //     const trials = stepper
  //       .table()
  //       .append({ type: 'instruction' })
  //       .append({ type: 'trial', id: 1 })
  //       .append({ type: 'trial', id: 2 })

  //     // Push trials to state machine
  //     stepper.push(trials)

  //     // Verify initial state
  //     expect(stepper.sm).toBeDefined()
  //     expect(stepper.index.value).toBe(0)

  //     // Verify state machine contains correct trials
  //     let currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'instruction' })

  //     currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'trial', id: 1 })

  //     currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'trial', id: 2 })

  //     // Verify we've reached the end
  //     expect(stepper.next()).toBeNull()
  //   })

  //   it('should handle nested trial structures', async () => {
  //     const stepper = getCurrentRouteStepper()

  //     // Build a nested trial structure
  //     const trials = stepper.table()
  //     trials.append({ phase: 'training' })

  //     // Add nested trials to the training phase
  //     const nestedTrials = trials[0]
  //       .table()
  //       .append({ type: 'instruction' })
  //       .append({ type: 'practice', id: 1 })
  //       .append({ type: 'practice', id: 2 })

  //     // Push trials to state machine
  //     stepper.push(trials)

  //     // Verify navigation through nested structure
  //     let currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ phase: 'training' })

  //     // Push nested trials
  //     stepper.push(nestedTrials)

  //     // Verify nested trials
  //     currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'instruction' })

  //     currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'practice', id: 1 })

  //     currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'practice', id: 2 })
  //   })

  //   it('should persist state in smilestore', async () => {
  //     const stepper = getCurrentRouteStepper()

  //     // Build and push trials
  //     const trials = stepper.table().append({ type: 'trial', id: 1 }).append({ type: 'trial', id: 2 })

  //     stepper.push(trials)

  //     // Navigate forward
  //     const firstTrial = stepper.next()
  //     expect(firstTrial).toEqual({ type: 'trial', id: 1 })

  //     // Get current route and verify state is saved
  //     const currentRoute = router.currentRoute.value
  //     const pageData = smilestore.getPageTrackerData(currentRoute.name)
  //     expect(pageData).toBeDefined()
  //     expect(pageData.stepperState).toBeDefined()

  //     // Create a new stepper instance (simulating page reload)
  //     const newStepper = getCurrentRouteStepper()

  //     // Verify state is restored
  //     const currentTrial = newStepper.next()
  //     expect(currentTrial).toEqual({ type: 'trial', id: 2 })
  //   })

  //   it('should handle reset correctly', async () => {
  //     const stepper = getCurrentRouteStepper()

  //     // Build and push trials
  //     const trials = stepper.table().append({ type: 'trial', id: 1 }).append({ type: 'trial', id: 2 })

  //     stepper.push(trials)

  //     // Navigate forward
  //     stepper.next()
  //     stepper.next()

  //     // Reset state
  //     stepper.reset()

  //     // Verify state machine is reset
  //     expect(stepper.index.value).toBe(0)

  //     // Verify state is cleared from smilestore
  //     const currentRoute = router.currentRoute.value
  //     const pageData = smilestore.getPageTrackerData(currentRoute.name)
  //     expect(pageData).toBeDefined()
  //     expect(pageData.stepperState).toBeNull()

  //     // Verify we can navigate from beginning again
  //     const firstTrial = stepper.next()
  //     expect(firstTrial).toEqual({ type: 'trial', id: 1 })
  //   })

  //   // Add test for array input
  //   it('should accept plain arrays as input', async () => {
  //     const stepper = getCurrentRouteStepper()

  //     // Create a plain array of trials
  //     const trials = [
  //       { type: 'trial', id: 1 },
  //       { type: 'trial', id: 2 },
  //     ]

  //     // Push trials to state machine
  //     stepper.push(trials)

  //     // Verify navigation works
  //     let currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'trial', id: 1 })

  //     currentTrial = stepper.next()
  //     expect(currentTrial).toEqual({ type: 'trial', id: 2 })
  //   })
  // })
})
