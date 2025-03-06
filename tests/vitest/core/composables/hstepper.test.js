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

// import the API composable (h stepper is a method of the API)
import useAPI from '@/core/composables/useAPI'
import { StepperStateMachine } from '@/core/composables/StepperStateMachine'

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

  it('should provide the useStepper method', async () => {
    expect(api).toBeDefined()
    expect(api.useHStepper).toBeDefined()
    expect(api.useHStepper).toBeInstanceOf(Function)
  })

  it('should create the stepper', async () => {
    const stepper = getCurrentRouteStepper()
    expect(stepper).toBeDefined()
  })

  it('should include the key functions in the stepper', async () => {
    const stepper = getCurrentRouteStepper()
    expect(stepper).toBeDefined()
    expect(stepper.next).toBeInstanceOf(Function)
    expect(stepper.prev).toBeInstanceOf(Function)
    expect(stepper.reset).toBeInstanceOf(Function)
    expect(stepper.index).toBeInstanceOf(Function)
    expect(stepper.current).toBeInstanceOf(Function)
  })

  it('should create a StepperStateMachine instance', async () => {
    const stepper = getCurrentRouteStepper()
    expect(stepper.sm).toBeInstanceOf(StepperStateMachine)
  })

  // it('should create a trial in the statemachine using push', async () => {
  //   const stepper = getCurrentRouteStepper()
  //   stepper.push({ name: 'test', value: 'test' })
  //   expect(stepper.sm.states).toEqual(['test'])
  // })

  // it('should provide the useStepper method', async () => {
  //   const stepper = api.useHStepper()
  //   expect(stepper).toBeInstanceOf(StepperStateMachine)
  // })
})
