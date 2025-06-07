/* eslint-disable no-undef */
// general testing functions
import { defineComponent } from 'vue'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHashHistory, useRoute } from 'vue-router'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// import shared mocks
import '../../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../../setup/mocks'

// Mock the config import
vi.mock('@/core/config', () => ({
  default: {
    maxStepperRows: 5000,
  },
}))

// import the composable
import useStepper from '@/core/composables/useStepper'
import useSmileStore from '@/core/stores/smilestore'

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
      const route = useRoute()
      const stepper = useStepper(route.name)
      return { stepper }
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

// Helper function to set up test environment
const setupTestEnvironment = async () => {
  // Reset mock state
  vi.clearAllMocks()

  // Create pinia instance and set it as active
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)

  // Get smilestore instance
  const smilestore = useSmileStore()

  // Create a fresh router
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  // Mount the test component
  const wrapper = mount(TestComponent, {
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

  // Helper function to get the stepper instance for the current route
  const getCurrentRouteStepper = () => {
    const currentRoute = router.currentRoute.value
    const mockComponent = wrapper.findComponent(currentRoute.matched[0].components.default)
    expect(mockComponent.exists()).toBe(true)
    return mockComponent.vm.stepper
  }

  return {
    router,
    wrapper,
    smilestore,
    getCurrentRouteStepper,
  }
}

// Helper function to set up test environment with serialized state
const setupTestEnvironmentWithSerializedState = async () => {
  // Reset mock state
  vi.clearAllMocks()

  // Create pinia instance and set it as active
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)

  // Get smilestore instance
  const smilestore = useSmileStore()

  // Create a mock serialized state
  const mockSerializedState = {
    stepperState: {
      id: '/',
      currentIndex: 1,
      depth: 0,
      shuffled: false,
      states: [
        {
          id: 'SOS',
          currentIndex: 0,
          depth: 1,
          shuffled: false,
          states: [],
          data: {},
        },
        {
          id: 'survey_page1',
          currentIndex: 0,
          depth: 1,
          shuffled: false,
          states: [],
          data: {
            path: 'survey_page1',
          },
        },
        {
          id: 'survey_page2',
          currentIndex: 0,
          depth: 1,
          shuffled: false,
          states: [],
          data: {
            path: 'survey_page2',
          },
        },
        {
          id: 'survey_page3',
          currentIndex: 0,
          depth: 1,
          shuffled: false,
          states: [],
          data: {
            path: 'survey_page3',
          },
        },
        {
          id: 'EOS',
          currentIndex: 0,
          depth: 1,
          shuffled: false,
          states: [],
          data: {},
        },
      ],
      data: {
        gvars: {
          forminfo: {
            dob: '',
            gender: '',
            race: '',
            hispanic: '',
            fluent_english: '',
            normal_vision: '',
            color_blind: '',
            learning_disability: '',
            neurodevelopmental_disorder: '',
            psychiatric_disorder: '',
            country: '',
            zipcode: '',
            education_level: '',
            household_income: '',
          },
        },
      },
    },
  }

  // Set up the mock state in smilestore
  smilestore.browserPersisted.viewSteppers['welcome_anonymous'] = {
    data: mockSerializedState,
  }

  // Create a fresh router
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  // Mount the test component
  const wrapper = mount(TestComponent, {
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

  // Helper function to get the stepper instance for the current route
  const getCurrentRouteStepper = () => {
    const currentRoute = router.currentRoute.value
    const mockComponent = wrapper.findComponent(currentRoute.matched[0].components.default)
    expect(mockComponent.exists()).toBe(true)
    return mockComponent.vm.stepper
  }

  return {
    router,
    wrapper,
    smilestore,
    getCurrentRouteStepper,
  }
}

describe('useStepper composable', () => {
  beforeAll(() => {
    setupBrowserEnvironment()
  })

  afterEach(() => {
    vi.clearAllMocks()
    const smilestore = useSmileStore()
    smilestore.browserEphemeral.steppers = {}
    smilestore.browserPersisted.viewSteppers = {}
    smilestore.dev.viewProvidesStepper = false
    wrapper?.unmount()
  })

  describe('basic functionality', () => {
    it('should create a new stepper instance when none exists', async () => {
      const { getCurrentRouteStepper, smilestore } = await setupTestEnvironment()

      const stepper = getCurrentRouteStepper()
      expect(stepper).toBeDefined()
      expect(stepper.name).toBe('welcome_anonymous')
      expect(smilestore.dev.viewProvidesStepper).toBe(true)
    })

    it('should reuse existing stepper instance when revisiting a view', async () => {
      const { router, getCurrentRouteStepper } = await setupTestEnvironment()

      // Get initial stepper
      const initialStepper = getCurrentRouteStepper()

      // Navigate away and back
      await router.push('/landing')
      await router.push('/')
      await flushPromises()

      // Get new stepper instance
      const newStepper = getCurrentRouteStepper()

      // Verify it's the same instance
      expect(newStepper).toBe(initialStepper)
    })
  })

  describe('serialized state handling', () => {
    it('should load stepper from serialized state', async () => {
      const { getCurrentRouteStepper } = await setupTestEnvironmentWithSerializedState()

      // Get stepper instance
      const stepper = getCurrentRouteStepper()

      // Verify stepper loaded the serialized state
      expect(stepper.pathData).toEqual([{ path: 'survey_page1' }])
      expect(stepper.index).toBe(1)

      // Verify navigation works
      stepper.next()
      expect(stepper.pathData).toEqual([{ path: 'survey_page2' }])
      expect(stepper.index).toBe(2)
    })

    it.skip('should create new stepper when serialized state is invalid', async () => {
      // Set up invalid serialized state
      const { getCurrentRouteStepper } = await setupTestEnvironmentWithSerializedState()

      // Get stepper instance
      const stepper = getCurrentRouteStepper()

      // Verify new stepper was created
      expect(stepper).toBeDefined()
      expect(stepper.name).toBe('test-view')
      expect(stepper.pathData).toEqual([])
    })

    it.skip('should handle missing serialized state gracefully', async () => {
      // Ensure no serialized state exists
      smilestore.browserPersisted.viewSteppers['test-view'] = null

      // Get stepper instance
      const stepper = getCurrentRouteStepper()

      // Verify new stepper was created
      expect(stepper).toBeDefined()
      expect(stepper.name).toBe('test-view')
      expect(stepper.pathData).toEqual([])
    })

    it.skip('should preserve stepper state across route changes', async () => {
      // Create a mock serialized state
      const mockSerializedState = {
        stepperState: {
          nodes: [
            { id: 'SOS', next: '1' },
            { id: '1', data: { type: 'trial', id: 1 }, next: '2' },
            { id: '2', data: { type: 'trial', id: 2 }, next: 'EOS' },
            { id: 'EOS' },
          ],
          current: '1',
          data: { type: 'trial', id: 1 },
        },
      }

      // Set up the mock state in smilestore
      smilestore.browserPersisted.viewSteppers['test-view'] = {
        data: mockSerializedState,
      }

      // Get initial stepper
      const initialStepper = getCurrentRouteStepper()
      expect(initialStepper.pathData).toEqual([{ type: 'trial', id: 1 }])

      // Navigate to next step
      initialStepper.goNextStep()
      expect(initialStepper.pathData).toEqual([{ type: 'trial', id: 2 }])

      // Navigate to different route and back
      await router.push('/landing')
      await router.push('/')
      await flushPromises()

      // Get new stepper instance
      const newStepper = getCurrentRouteStepper()

      // Verify state was preserved
      expect(newStepper.pathData).toEqual([{ type: 'trial', id: 2 }])
      expect(newStepper.index).toBe(2)
    })
  })
})
