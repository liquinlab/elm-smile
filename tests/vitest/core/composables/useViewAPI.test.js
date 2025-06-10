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
  let router
  let wrapper
  let api
  let pinia

  beforeAll(() => {
    setupBrowserEnvironment()
  })

  beforeEach(async () => {
    // Reset mock state
    vi.clearAllMocks()

    // Create pinia instance
    pinia = setupPinia()

    // Create a fresh router for each test
    router = createRouter({
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

    // Get API from the MockComponent instance
    const mockComponent = wrapper.findComponent({ name: 'MockComponent' })
    api = mockComponent.vm.api
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should provide all core API functionality plus view-specific features', () => {
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

  it('should handle timing methods correctly', async () => {
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

  it('should handle data recording and persistence correctly', async () => {
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
