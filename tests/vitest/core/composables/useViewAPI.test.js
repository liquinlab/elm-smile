// general testing functions
import { defineComponent, h } from 'vue'
import { setActivePinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'

// import shared mocks
import '../../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../../setup/mocks'

/* eslint-disable no-undef */
// Mock the config import before any other imports
vi.mock('@/core/config', () => ({
  default: {
    mode: 'production',
  },
}))

// import the composable
import useViewAPI from '@/core/composables/useViewAPI'

// Helper function to set up Pinia
const setupPinia = () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  return pinia
}

// Helper function to get mock component and its API
const getMockComponentAndAPI = (wrapper) => {
  const mockComponent = wrapper.findComponent({ name: 'MockComponent' })
  return {
    component: mockComponent,
    api: mockComponent.vm.api,
  }
}

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
      const api = useViewAPI()
      return { api }
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

describe('useViewAPI composable', () => {
  let wrapper

  beforeAll(() => {
    setupBrowserEnvironment()
  })

  beforeEach(async () => {
    // Reset the ViewAPI instance
    useViewAPI._reset()
    // Reset mock state
    vi.clearAllMocks()

    // Create pinia instance
    const pinia = setupPinia()

    // Create a fresh router for each test
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    // Mount the test component
    wrapper = mount(TestComponent, {
      global: {
        plugins: [router, pinia],
        stubs: {
          RouterLink: true,
        },
      },
    })

    // Navigate to the first route and wait for it to be ready
    await router.push('/')
    await router.isReady()
    await flushPromises()
  })

  afterEach(async () => {
    // Clear any persisted state
    const mockComponent = wrapper.findComponent({ name: 'MockComponent' })
    if (mockComponent && mockComponent.vm.api) {
      mockComponent.vm.api.clear()
      mockComponent.vm.api.clearPersist()
    }

    wrapper.unmount()
  })

  it('should provide all core API functionality plus view-specific features', () => {
    // Get API from the MockComponent instance
    const { api } = getMockComponentAndAPI(wrapper)
    // Check core API functionality
    expect(api.store).toBeDefined()
    expect(api.config).toBeDefined()
    expect(api.data).toBeDefined()
    expect(api.private).toBeDefined()

    // Check view-specific functionality
    expect(api.steps).toBeDefined()
    expect(api.stepData).toBeDefined()
    expect(api.pathString).toBeDefined()
    expect(api.path).toBeDefined()
    expect(api.length).toBeDefined()
    expect(api.nSteps).toBeDefined()
    expect(api.persist).toBeDefined()
    expect(api.blockIndex).toBeDefined()
    expect(api.blockLength).toBeDefined()

    // Check stepper control methods
    expect(api.goNextStep).toBeInstanceOf(Function)
    expect(api.goPrevStep).toBeInstanceOf(Function)
    expect(api.goFirstStep).toBeInstanceOf(Function)
    expect(api.goToStep).toBeInstanceOf(Function)
    expect(api.hasNextStep).toBeInstanceOf(Function)
    expect(api.hasPrevStep).toBeInstanceOf(Function)
    expect(api.hasSteps).toBeInstanceOf(Function)

    // Check timing methods
    expect(api.startTimer).toBeInstanceOf(Function)
    expect(api.timerStarted).toBeInstanceOf(Function)
    expect(api.elapsedTime).toBeInstanceOf(Function)
    expect(api.elapsedTimeInSeconds).toBeInstanceOf(Function)
    expect(api.elapsedTimeInMinutes).toBeInstanceOf(Function)

    // Check data recording methods
    expect(api.recordStep).toBeInstanceOf(Function)
    expect(api.stepperData).toBeInstanceOf(Function)
    expect(api.clear).toBeInstanceOf(Function)
    expect(api.clearPersist).toBeInstanceOf(Function)
  })

  it('should handle stepper navigation correctly', async () => {
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps directly using api.steps
    api.steps.append([
      { path: 'step1', test: 'value' },
      { path: 'step2', test: 'value2' },
    ])

    expect(api.nSteps).toBe(2) // appended
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ path: 'step1', test: 'value' })

    // Test next step
    expect(api.hasNextStep()).toBe(true)
    api.goNextStep()
    expect(api.pathString).toBe('step2')

    // Test previous step
    expect(api.hasPrevStep()).toBe(true)
    api.goPrevStep()
    expect(api.pathString).toBe('step1')

    // // Test go to specific step
    api.goToStep('step2')
    expect(api.pathString).toBe('step2')

    // Test first step
    api.goFirstStep()
    expect(api.pathString).toBe('step1')
  })

  it('should handle stepIndex and boundary conditions correctly', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Add a sequence of steps
    api.steps.append([
      { path: 'start', test: 'start' },
      { path: 'middle1', test: 'middle1' },
      { path: 'middle2', test: 'middle2' },
      { path: 'end', test: 'end' },
    ])

    // Verify initial state
    expect(api.nSteps).toBe(4)
    expect(api.stepIndex).toBe(0)
    expect(api.pathString).toBe('start')
    expect(api.hasPrevStep()).toBe(false)
    expect(api.hasNextStep()).toBe(true)

    // Walk through the sequence
    api.goNextStep()
    expect(api.stepIndex).toBe(1)
    expect(api.pathString).toBe('middle1')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goNextStep()
    expect(api.stepIndex).toBe(2)
    expect(api.pathString).toBe('middle2')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goNextStep()
    expect(api.stepIndex).toBe(3)
    expect(api.pathString).toBe('end')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(false)

    // Walk backwards
    api.goPrevStep()
    expect(api.stepIndex).toBe(2)
    expect(api.pathString).toBe('middle2')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goPrevStep()
    expect(api.stepIndex).toBe(1)
    expect(api.pathString).toBe('middle1')
    expect(api.hasPrevStep()).toBe(true)
    expect(api.hasNextStep()).toBe(true)

    api.goPrevStep()
    expect(api.stepIndex).toBe(0)
    expect(api.pathString).toBe('start')
    expect(api.hasPrevStep()).toBe(false)
    expect(api.hasNextStep()).toBe(true)

    // Test jumping to specific indices
    api.goToStep('end')
    expect(api.stepIndex).toBe(3)
    expect(api.pathString).toBe('end')

    api.goToStep('start')
    expect(api.stepIndex).toBe(0)
    expect(api.pathString).toBe('start')
  })

  it.skip('should handle complex nested state construction and navigation', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Create initial trial structure
    const trials = api.steps.append([
      {
        path: 'trial',
        rt: 0,
        hit: 0,
        response: '',
      },
      { path: 'summary' },
    ])

    // Create a factorial design with multiple dimensions
    trials[0]
      .outer({
        color: ['red', 'blue'],
        size: ['small', 'large'],
        shape: ['square', 'circle'],
      })
      .forEach((row) => {
        // Create a unique identifier for each combination
        const pathString =
          (row.data.color === 'red' ? 'r' : 'b') +
          (row.data.size === 'small' ? 's' : 'l') +
          (row.data.shape === 'square' ? 's' : 'c')
        row.id = pathString
      })
      .shuffle()

    // Verify the structure was created correctly
    expect(api.nSteps).toBe(9) // 8 factorial combinations + 1 summary step
    expect(api.pathString).toBe('trial')

    // Verify we can access the data for each combination
    const allData = api.stepperData()
    console.log('All data:', allData) // Debug log
    expect(allData.length).toBe(9) // 8 factorial combinations + 1 summary step

    // Verify each combination has the correct structure
    const combinations = allData.filter((d) => d.path === 'trial')
    expect(combinations.length).toBe(8) // Should have exactly 8 factorial combinations

    // Check that each combination has all required properties
    combinations.forEach((combo) => {
      expect(combo).toHaveProperty('color')
      expect(combo).toHaveProperty('size')
      expect(combo).toHaveProperty('shape')
      expect(combo).toHaveProperty('rt')
      expect(combo).toHaveProperty('hit')
      expect(combo).toHaveProperty('response')
      expect(combo).toHaveProperty('id')
    })

    // Verify we can navigate through all combinations
    let visitedPaths = new Set()
    while (api.hasNextStep()) {
      const currentData = api.stepData
      expect(currentData).toHaveProperty('id')
      visitedPaths.add(currentData.id)
      api.goNextStep()
    }

    // Verify we visited all combinations
    expect(visitedPaths.size).toBe(8)

    // Verify we end up at the summary step
    expect(api.pathString).toBe('summary')

    // Verify we can go back through all combinations
    while (api.hasPrevStep()) {
      api.goPrevStep()
      const currentData = api.stepData
      expect(currentData).toHaveProperty('id')
    }

    // Verify we're back at the start
    expect(api.pathString).toBe('trial')
    expect(api.stepIndex).toBe(0)
  })

  it('should handle dynamic state addition and navigation', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    await flushPromises()
    api.clear()

    // Add initial states
    api.steps.append([
      { path: 'initial1', test: 'value1' },
      { path: 'initial2', test: 'value2' },
    ])

    //console.log('api.steps', api.steps._states)

    // Verify initial state
    expect(api.nSteps).toBe(2)
    expect(api.pathString).toBe('initial1')
    expect(api.stepData).toEqual({ path: 'initial1', test: 'value1' })

    // Navigate to the end of initial states
    api.goNextStep()
    expect(api.pathString).toBe('initial2')
    expect(api.stepData).toEqual({ path: 'initial2', test: 'value2' })

    // Add more states while at the end
    api.steps.append([
      { path: 'dynamic1', test: 'value3' },
      { path: 'dynamic2', test: 'value4' },
    ])

    // Verify we can now navigate to the new states
    expect(api.nSteps).toBe(4)
    expect(api.hasNextStep()).toBe(true)

    api.goNextStep()
    expect(api.pathString).toBe('dynamic1')
    expect(api.stepData).toEqual({ path: 'dynamic1', test: 'value3' })

    api.goNextStep()
    expect(api.pathString).toBe('dynamic2')
    expect(api.stepData).toEqual({ path: 'dynamic2', test: 'value4' })

    // Verify we can go back through all states
    api.goPrevStep()
    expect(api.pathString).toBe('dynamic1')

    api.goPrevStep()
    expect(api.pathString).toBe('initial2')

    api.goPrevStep()
    expect(api.pathString).toBe('initial1')
  })

  it('should handle timing methods correctly', async () => {
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps using api.steps
    api.steps.append([
      { path: 'step1', data: { value: 1 } },
      { path: 'step2', data: { value: 2 } },
    ])

    // Mock Date.now
    const mockNow = 1000000
    vi.spyOn(Date, 'now').mockReturnValue(mockNow)

    // Test timer start
    api.startTimer('test')
    expect(api.persist.startTime_test).toBe(mockNow)

    // Test timer started check
    expect(api.timerStarted('test')).toBe(mockNow)
    expect(api.timerStarted('nonexistent')).toBe(false)

    // Test elapsed time calculations
    const laterTime = mockNow + 5000 // 5 seconds later
    vi.spyOn(Date, 'now').mockReturnValue(laterTime)

    expect(api.elapsedTime('test')).toBe(5000)
    expect(api.elapsedTimeInSeconds('test')).toBe(5)
    expect(api.elapsedTimeInMinutes('test')).toBe(5 / 60)
  })

  it('should correctly track hierarchical indices and lengths', async () => {
    const { api } = getMockComponentAndAPI(wrapper)

    // Create a hierarchical structure with blocks and steps
    const trials = api.steps.append([
      {
        path: 'practice',
        type: 'block',
        data: { blockType: 'practice' },
      },
      {
        path: 'main',
        type: 'block',
        data: { blockType: 'main' },
      },
    ])

    // Add practice trials
    trials[0].append([
      { path: 'trial1', data: { trialType: 'practice1' } },
      { path: 'trial2', data: { trialType: 'practice2' } },
    ])

    // Add main trials with factorial design
    trials[1]
      .outer({
        condition: ['A', 'B'],
        difficulty: ['easy', 'hard'],
      })
      .forEach((row) => {
        row.id = `${row.data.condition}_${row.data.difficulty}`
      })

    // Initially at first practice trial
    expect(api.pathString).toBe('practice/trial1')
    expect(api.stepIndex).toBe(0) // First step overall
    expect(api.blockIndex).toBe(0) // First trial in practice block
    expect(api.blockLength).toBe(2) // Two trials in practice block
    expect(api.nSteps).toBe(6) // Total steps: 2 practice + 4 main trials

    // Move to second practice trial
    api.goNextStep()
    expect(api.pathString).toBe('practice/trial2')
    expect(api.stepIndex).toBe(1) // Second step overall
    expect(api.blockIndex).toBe(1) // Second trial in practice block
    expect(api.blockLength).toBe(2) // Two trials in practice block
    expect(api.nSteps).toBe(6) // Total steps unchanged

    // Move to first main trial
    api.goNextStep()
    expect(api.pathString).toBe('main/A_easy')
    expect(api.stepIndex).toBe(2) // Third step overall
    expect(api.blockIndex).toBe(0) // First trial in main block
    expect(api.blockLength).toBe(4) // Four trials in main block
    expect(api.nSteps).toBe(6) // Total steps unchanged

    // Move through main trials
    api.goNextStep()
    expect(api.pathString).toBe('main/A_hard')
    expect(api.stepIndex).toBe(3)
    expect(api.blockIndex).toBe(1)
    expect(api.blockLength).toBe(4)

    api.goNextStep()
    expect(api.pathString).toBe('main/B_easy')
    expect(api.stepIndex).toBe(4)
    expect(api.blockIndex).toBe(2)
    expect(api.blockLength).toBe(4)

    api.goNextStep()
    expect(api.pathString).toBe('main/B_hard')
    expect(api.stepIndex).toBe(5)
    expect(api.blockIndex).toBe(3)
    expect(api.blockLength).toBe(4)

    // Verify we can't go further
    expect(api.hasNextStep()).toBe(false)

    // Go back through the trials
    api.goPrevStep()
    expect(api.pathString).toBe('main/B_easy')
    expect(api.stepIndex).toBe(4)
    expect(api.blockIndex).toBe(2)
    expect(api.blockLength).toBe(4)

    api.goPrevStep()
    expect(api.pathString).toBe('main/A_hard')
    expect(api.stepIndex).toBe(3)
    expect(api.blockIndex).toBe(1)
    expect(api.blockLength).toBe(4)

    api.goPrevStep()
    expect(api.pathString).toBe('main/A_easy')
    expect(api.stepIndex).toBe(2)
    expect(api.blockIndex).toBe(0)
    expect(api.blockLength).toBe(4)

    api.goPrevStep()
    expect(api.pathString).toBe('practice/trial2')
    expect(api.stepIndex).toBe(1)
    expect(api.blockIndex).toBe(1)
    expect(api.blockLength).toBe(2)

    api.goPrevStep()
    expect(api.pathString).toBe('practice/trial1')
    expect(api.stepIndex).toBe(0)
    expect(api.blockIndex).toBe(0)
    expect(api.blockLength).toBe(2)

    // Verify we can't go back further
    expect(api.hasPrevStep()).toBe(false)
  })

  it('should handle data recording and persistence correctly', async () => {
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps using api.steps
    api.steps.append([
      { path: 'step1', test: 'value' },
      { path: 'step2', test: 'value2' },
    ])

    // Test step data access
    expect(api.stepData).toEqual({ path: 'step1', test: 'value' })

    // Test data recording
    const recordDataSpy = vi.spyOn(api, 'recordData')
    api.recordStep()
    expect(recordDataSpy).toHaveBeenCalledWith({ path: 'step1', test: 'value' })

    // Test stepper data retrieval
    const data = api.stepperData()
    expect(data).toEqual([
      { path: 'step1', test: 'value' },
      { path: 'step2', test: 'value2' },
    ])

    // Test clearing data
    const clearSpy = vi.spyOn(api, 'clear')
    api.clear()
    expect(clearSpy).toHaveBeenCalled()

    // Test clearing persistence
    const clearPersistSpy = vi.spyOn(api, 'clearPersist')
    api.clearPersist()
    expect(clearPersistSpy).toHaveBeenCalled()
  })

  it('should ignore keyboard navigation in live', async () => {
    const { api } = getMockComponentAndAPI(wrapper)
    // Add steps using api.steps
    api.steps.append([
      { path: 'step1', test: 'value' },
      { path: 'step2', test: 'value2' },
    ])

    expect(api.config.mode).toBe('production')
    // Verify initial state
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ path: 'step1', test: 'value' })

    // Simulate right arrow key press
    const rightEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    })
    document.dispatchEvent(rightEvent)
    await flushPromises()

    // Verify we did not move to next step
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ path: 'step1', test: 'value' })

    // Simulate left arrow key press
    const leftEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
    })
    document.dispatchEvent(leftEvent)
    await flushPromises()

    // Verify we did not move back to previous step
    expect(api.pathString).toBe('step1')
    expect(api.stepData).toEqual({ path: 'step1', test: 'value' })
  })
})
