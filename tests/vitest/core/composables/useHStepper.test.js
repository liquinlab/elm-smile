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
      const { step, table } = api.useHStepper()
      return { api, step, table }
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
    return { step: mockComponent.vm.step, table: mockComponent.vm.table }
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
      const { step } = getCurrentRouteStepper()
      expect(step).toBeDefined()
      expect(step.next).toBeInstanceOf(Function)
      expect(step.prev).toBeInstanceOf(Function)
      expect(step.reset).toBeInstanceOf(Function)
    })
  })

  it('should provide the new() method', async () => {
    const { table } = getCurrentRouteStepper()
    expect(table.new).toBeInstanceOf(Function)
  })

  it('should create a new table with chainable methods', async () => {
    const { table } = getCurrentRouteStepper()
    const t1 = table.new()

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
    expect(t1[0].new).toBeInstanceOf(Function)
  })

  it('should throw errors if chain methods are called before new()', async () => {
    const { table } = getCurrentRouteStepper()

    // Test all chainable methods
    const methods = ['append', 'shuffle', 'sample', 'repeat', 'push', 'forEach', 'zip', 'outer', 'range']

    methods.forEach((method) => {
      expect(() => {
        table[method]()
      }).toThrow(`${method}() must be called after new()`)
    })
  })

  describe('basic creation operations', () => {
    it('should provide the useStepper method', async () => {
      expect(api).toBeDefined()
      expect(api.useHStepper).toBeDefined()
      expect(api.useHStepper).toBeInstanceOf(Function)
    })

    it('should create the stepper', async () => {
      const { step } = getCurrentRouteStepper()
      expect(step).toBeDefined()
    })

    it('should create the table api', async () => {
      const { table } = getCurrentRouteStepper()
      expect(table).toBeDefined()
    })

    it('should include the key top-level functions in the stepper', async () => {
      const { step } = getCurrentRouteStepper()
      expect(step).toBeDefined()
      expect(step.next).toBeInstanceOf(Function)
      expect(step.prev).toBeInstanceOf(Function)
      expect(step.reset).toBeInstanceOf(Function)
      expect(step.index).toBeDefined()
      expect(step.current).toBeDefined()
      expect(step.sm).toBeInstanceOf(StepperStateMachine)
    })

    it('should create a StepperStateMachine instance', async () => {
      const { step } = getCurrentRouteStepper()
      expect(step.sm).toBeInstanceOf(StepperStateMachine)
    })
  })

  describe('complex tests', () => {
    it('should handle nesting after shuffling', async () => {
      // specifically
      const { table } = getCurrentRouteStepper()
      const trials = table.new().range(10).shuffle()
      const nestedTable = trials[0].new().range(3)
      expect(nestedTable.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable.rows[i]).toEqual({ range: i })
      }
    })

    it('should handle nesting after sampling', async () => {
      // specifically
      const { table } = getCurrentRouteStepper()
      const trials = table.new().range(10)
      trials.sample({
        type: 'with-replacement',
        size: 3,
      })
      const nestedTable = trials[0].new().range(3)
      expect(nestedTable.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable.rows[i]).toEqual({ range: i })
      }
    })

    it('should handle shuffling at the top level after a nested table created', async () => {
      const { table } = getCurrentRouteStepper()
      const trials = table.new().range(10)
      const nestedTable = trials[3].new().range(3)
      trials.shuffle()
      expect(nestedTable.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable.rows[i]).toEqual({ range: i })
      }
    })

    it('should raise an error when modifying dimensionality of a table with nested tables', async () => {
      const { table } = getCurrentRouteStepper()
      const trials = table.new().range(10)
      const nestedTable = trials[3].new().range(3)

      // Test sample()
      expect(() => {
        trials.sample({
          type: 'with-replacement',
          size: 1,
        })
      }).toThrow('Cannot sample a table that has nested tables')

      // Test head()
      expect(() => {
        trials.head(5)
      }).toThrow('Cannot take head of a table that has nested tables')

      // Test tail()
      expect(() => {
        trials.tail(5)
      }).toThrow('Cannot take tail of a table that has nested tables')

      // Test slice()
      expect(() => {
        trials.slice(0, 5)
      }).toThrow('Cannot slice a table that has nested tables')

      // Verify the nested table is still intact
      expect(nestedTable.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable.rows[i]).toEqual({ range: i })
      }
    })

    it('should copy the nested table when repeating', async () => {
      const { table } = getCurrentRouteStepper()
      const trials = table.new().range(10)
      const nestedTable = trials[3].new().range(3)
      trials.repeat(2)

      // Verify that the original nested table is still in place
      expect(trials[3][Symbol.for('table')]).toBe(nestedTable)

      // Verify that the repeated row has a different nested table instance
      expect(trials[13][Symbol.for('table')]).not.toBe(nestedTable)

      // Verify that the repeated nested table has the same data
      expect(trials[13][Symbol.for('table')].rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(trials[13][Symbol.for('table')].rows[i]).toEqual({ range: i })
      }

      // Verify that modifying the repeated nested table doesn't affect the original
      trials[13][Symbol.for('table')].rows[0].value = 'modified'
      expect(trials[3][Symbol.for('table')].rows[0].value).toBeUndefined()
    })

    it('should allow creating nested tables with repeat and forEach', async () => {
      const { table } = getCurrentRouteStepper()
      const trials = table.new().range(10) // allocate 10 units
      expect(trials[0].length).toBe(1)
      trials.forEach((row, i) => {
        row.append({ trial: i })
        row.new().append([
          { type: 'stim', index: i },
          { type: 'feedback', index: i },
        ])
      })
      trials.shuffle('1234')
      trials.print()

      expect(trials[0].length).toBe(1)
      expect(Object.keys(trials[0]).length).toBe(2)

      // verify that shuffle worked
      expect(trials[0].trial).not.toBe(0) // low probability of being in sequential order esp with this seed

      // After shuffling, the trial property should still exist but will be in a different order
      const trialValues = trials.rows.map((row) => row.trial).sort()
      expect(trialValues).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

      // Each row should still have its nested table with the correct index
      trials.rows.forEach((row) => {
        const nestedTable = row[Symbol.for('table')]
        expect(nestedTable).toBeDefined()
        expect(nestedTable.rows).toHaveLength(2)
        expect(nestedTable.rows[0].index).toBe(row.trial)
        expect(nestedTable.rows[1].index).toBe(row.trial)
      })
    })
  })

  describe('push() method', () => {
    it.only('should push a table to the state machine', async () => {
      const { step, table } = getCurrentRouteStepper()
      const trials = table.new().range(10)
      trials.print()
      step.push(trials)
      console.log(step.sm.getTreeDiagram())
      expect(step.sm.current).toBe(trials)
    })
  })

  describe.skip('stepper state machine integration', () => {
    let smilestore

    beforeEach(async () => {
      // Reset mock state
      vi.clearAllMocks()

      // Create a fresh router for each test
      router = createRouter({
        history: createWebHashHistory(),
        routes,
      })

      // Create pinia instance and set it as active
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn,
      })
      setActivePinia(pinia)

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

      // Get API and smilestore instances
      api = getCurrentRouteAPI()
      smilestore = useSmileStore()

      // Ensure page tracker is registered for the current route
      const currentRoute = router.currentRoute.value
      smilestore.registerPageTracker(currentRoute.name)
    })

    it('should correctly build and push trials to state machine', async () => {
      const { step, table } = getCurrentRouteStepper()

      // Build a simple trial structure
      const trials = table
        .new()
        .append({ type: 'instruction' })
        .append({ type: 'trial', id: 1 })
        .append({ type: 'trial', id: 2 })

      // Push trials to state machine
      step.push(trials)

      // Verify initial state
      expect(step.sm).toBeDefined()
      expect(step.index.value).toBe(0)

      // Verify state machine contains correct trials
      let currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'instruction' })

      currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'trial', id: 1 })

      currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'trial', id: 2 })

      // Verify we've reached the end
      expect(step.next()).toBeNull()
    })

    it('should handle nested trial structures', async () => {
      const { step, table } = getCurrentRouteStepper()

      // Build a nested trial structure
      const trials = table.new()
      trials.append({ phase: 'training' })

      // Add nested trials to the training phase
      const nestedTrials = trials[0]
        .new()
        .append({ type: 'instruction' })
        .append({ type: 'practice', id: 1 })
        .append({ type: 'practice', id: 2 })

      // Push trials to state machine
      step.push(trials)

      // Verify navigation through nested structure
      let currentTrial = step.next()
      expect(currentTrial).toEqual({ phase: 'training' })

      // Push nested trials
      step.push(nestedTrials)

      // Verify nested trials
      currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'instruction' })

      currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'practice', id: 1 })

      currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'practice', id: 2 })
    })

    it('should persist state in smilestore', async () => {
      const { step, table } = getCurrentRouteStepper()

      // Build and push trials
      const trials = table.new().append({ type: 'trial', id: 1 }).append({ type: 'trial', id: 2 })

      step.push(trials)

      // Navigate forward
      const firstTrial = step.next()
      expect(firstTrial).toEqual({ type: 'trial', id: 1 })

      // Get current route and verify state is saved
      const currentRoute = router.currentRoute.value
      const pageData = smilestore.getPageTrackerData(currentRoute.name)
      expect(pageData).toBeDefined()
      expect(pageData.stepperState).toBeDefined()

      // Create a new stepper instance (simulating page reload)
      const { step: newStep } = getCurrentRouteStepper()

      // Verify state is restored
      const currentTrial = newStep.next()
      expect(currentTrial).toEqual({ type: 'trial', id: 2 })
    })

    it('should handle reset correctly', async () => {
      const { step, table } = getCurrentRouteStepper()

      // Build and push trials
      const trials = table.new().append({ type: 'trial', id: 1 }).append({ type: 'trial', id: 2 })

      step.push(trials)

      // Navigate forward
      step.next()
      step.next()

      // Reset state
      step.reset()

      // Verify state machine is reset
      expect(step.index.value).toBe(0)

      // Verify state is cleared from smilestore
      const currentRoute = router.currentRoute.value
      const pageData = smilestore.getPageTrackerData(currentRoute.name)
      expect(pageData).toBeDefined()
      expect(pageData.stepperState).toBeNull()

      // Verify we can navigate from beginning again
      const firstTrial = step.next()
      expect(firstTrial).toEqual({ type: 'trial', id: 1 })
    })

    // Add test for array input
    it('should accept plain arrays as input', async () => {
      const { step } = getCurrentRouteStepper()

      // Create a plain array of trials
      const trials = [
        { type: 'trial', id: 1 },
        { type: 'trial', id: 2 },
      ]

      // Push trials to state machine
      step.push(trials)

      // Verify navigation works
      let currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'trial', id: 1 })

      currentTrial = step.next()
      expect(currentTrial).toEqual({ type: 'trial', id: 2 })
    })
  })
})
