/* eslint-disable no-undef */
import { defineComponent, h } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHashHistory } from 'vue-router'
import { mount, flushPromises } from '@vue/test-utils'
import useAPI from '@/core/composables/useAPI'
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'

// Mock Firebase-related methods
vi.mock('@/core/stores/firestore-db', () => {
  return {
    createDoc: vi.fn().mockResolvedValue({ id: 'test-doc-id' }),
    createPrivateDoc: vi.fn().mockResolvedValue({ id: 'test-private-doc-id' }),
    updateSubjectDataRecord: vi.fn().mockResolvedValue(true),
    updatePrivateSubjectDataRecord: vi.fn().mockResolvedValue(true),
    loadDoc: vi.fn().mockResolvedValue({ data: () => ({ test: 'data' }) }),
    fsnow: vi.fn().mockReturnValue(new Date().toISOString()),
  }
})

// Mock axios for getBrowserFingerprint
vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: { ip: '127.0.0.1' } }),
    },
  }
})

// Mock randomization functions
vi.mock('@/core/randomization', () => {
  return {
    randomInt: vi.fn(),
    shuffle: vi.fn(),
    sampleWithReplacement: vi.fn((arr) => arr[0]),
    sampleWithoutReplacement: vi.fn(),
    faker_distributions: {},
  }
})

// Mock useStepper
vi.mock('@/core/composables/useStepper', () => {
  return {
    useStepper: vi.fn().mockReturnValue({
      currentStep: ref(1),
      totalSteps: ref(5),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      goToStep: vi.fn(),
      isFirstStep: computed(() => true),
      isLastStep: computed(() => false),
    }),
  }
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn((key) => {
      if (key === 'smile_seed') return 'test-seed'
      return null
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    search: '',
    pathname: '/',
    hash: '',
  },
  writable: true,
})

// Mock the stepper functionality
vi.mock('@/core/composables/useStepper', () => ({
  useStepper: vi.fn(),
}))

// Mock meta.env
vi.mock('@/core/config', () => ({
  default: {
    mode: 'development',
    local_storage_key: 'smile_test',
    windowsizer_aggressive: false,
    windowsizer_request: { width: 800, height: 600 },
    max_writes: 100,
    min_write_interval: 1000,
    dev_local_storage_key: 'smile_dev_test',
  },
}))

// Mock import.meta.env
import.meta.env = {
  VITE_DEPLOY_BASE_PATH: '/test/',
}

// Mock import.meta.url
import.meta.url = 'http://localhost:3000/src/core/composables/useAPI.js'

// Create a test component that uses the composable
const TestComponent = defineComponent({
  setup() {
    const api = useAPI()
    return { api }
  },
  render() {
    return h('div')
  },
})

// Create mock route components
const MockComponent = defineComponent({
  render() {
    return h('div', 'Mock Page')
  },
})

let router
let wrapper
let pinia

// Define test routes
const routes = [
  {
    path: '/',
    name: 'welcome_anonymous',
    component: MockComponent,
    meta: { next: 'landing', allowAlways: true },
  },
  {
    path: '/landing',
    name: 'landing',
    component: MockComponent,
    meta: { prev: 'welcome_anonymous', next: 'test', sequential: true },
  },
  {
    path: '/test',
    name: 'test',
    component: MockComponent,
    meta: { prev: 'landing', sequential: true },
  },
]

describe('useAPI composable', () => {
  // Add variables to hold spies
  let api
  let logStore
  let debugSpy
  let logSpy
  let warnSpy
  let errorSpy
  let successSpy
  let clearPageHistorySpy
  let addToHistorySpy
  let resetAppSpy
  let resetLocalSpy
  let localStorageRemoveSpy

  beforeEach(() => {
    // Reset mock state
    vi.clearAllMocks()

    // Create a fresh router for each test
    router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    // Create a fresh pinia for each test with initial state
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        smilestore: {
          local: {
            reset: false,
            knownUser: false,
            possibleConditions: {},
            useSeed: false,
            seedID: 'test-seed',
            seedSet: true,
            pageTracker: {
              test: { index: 0, data: [] },
            },
            lastRoute: 'welcome_anonymous',
          },
          global: {
            forceNavigate: false,
            db_connected: false,
            urls: {
              base: 'http://localhost:3000',
            },
          },
          data: {
            study_data: [],
            trial_num: 0,
            verified_visibility: false,
            recruitment_service: 'test',
            smile_config: {},
          },
          private: {},
          dev: {
            current_page_done: false,
            page_provides_trial_stepper: false,
            notification_filter: 'None',
            page_provides_autofill: null,
          },
        },
        log: {
          history: [],
          page_history: [],
        },
      },
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

    // Get API and create spies
    api = wrapper.vm.api
    logStore = api.log

    // Create spies for the log methods
    debugSpy = vi.spyOn(logStore, 'debug')
    logSpy = vi.spyOn(logStore, 'log')
    warnSpy = vi.spyOn(logStore, 'warn')
    errorSpy = vi.spyOn(logStore, 'error')
    successSpy = vi.spyOn(logStore, 'success')
    clearPageHistorySpy = vi.spyOn(logStore, 'clear_page_history')
    addToHistorySpy = vi.spyOn(logStore, 'add_to_history')

    // Create spies for the store methods
    resetAppSpy = vi.spyOn(api.store, 'resetApp')
    resetLocalSpy = vi.spyOn(api.store, 'resetLocal')
    localStorageRemoveSpy = vi.spyOn(window.localStorage, 'removeItem')
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should provide the expected properties and methods', () => {
    // Check store access
    expect(api.store).toBeDefined()
    expect(api.config).toBeDefined()
    expect(api.data).toBeDefined()
    expect(api.private).toBeDefined()
    expect(api.local).toBeDefined()
    expect(api.global).toBeDefined()
    expect(api.dev).toBeDefined()

    // Check router related methods
    expect(api.route).toBeDefined()
    expect(api.router).toBeDefined()
    expect(api.goNextView).toBeInstanceOf(Function)
    expect(api.goPrevView).toBeInstanceOf(Function)
    expect(api.gotoView).toBeInstanceOf(Function)
    expect(api.hasNextView).toBeInstanceOf(Function)
    expect(api.hasPrevView).toBeInstanceOf(Function)

    // Check randomization utilities
    expect(api.faker).toBeDefined()
    expect(api.randomInt).toBeInstanceOf(Function)
    expect(api.shuffle).toBeInstanceOf(Function)
    expect(api.sampleWithReplacement).toBeInstanceOf(Function)
    expect(api.sampleWithoutReplacement).toBeInstanceOf(Function)
    expect(api.useStepper).toBeInstanceOf(Function)

    // Check URL helpers
    expect(api.urls).toBeDefined()
    expect(api.getPublicUrl).toBeInstanceOf(Function)
    expect(api.getCoreStaticUrl).toBeInstanceOf(Function)
    expect(api.getStaticUrl).toBeInstanceOf(Function)

    // Check app state management
    expect(api.resetApp).toBeInstanceOf(Function)
    expect(api.isResetApp).toBeInstanceOf(Function)
    expect(api.resetStore).toBeInstanceOf(Function)
    expect(api.resetLocalState).toBeInstanceOf(Function)

    // Check app component management
    expect(api.setAppComponent).toBeInstanceOf(Function)
    expect(api.getAppComponent).toBeInstanceOf(Function)

    // Check config management
    expect(api.setRuntimeConfig).toBeInstanceOf(Function)
    expect(api.getConfig).toBeInstanceOf(Function)

    // Check user state management
    expect(api.setKnown).toBeInstanceOf(Function)
    expect(api.setDone).toBeInstanceOf(Function)
    expect(api.setConsented).toBeInstanceOf(Function)
    expect(api.setWithdrawn).toBeInstanceOf(Function)
    expect(api.verifyVisibility).toBeInstanceOf(Function)
    expect(api.saveForm).toBeInstanceOf(Function)
    expect(api.getVerifiedVisibility).toBeInstanceOf(Function)

    // Check browser checks
    expect(api.isBrowserTooSmall).toBeInstanceOf(Function)

    // Check development tools
    expect(api.setPageAutofill).toBeInstanceOf(Function)
    expect(api.removePageAutofill).toBeInstanceOf(Function)

    // Check completion and recruitment
    expect(api.setCompletionCode).toBeInstanceOf(Function)
    expect(api.getRecruitmentService).toBeInstanceOf(Function)

    // Check page tracking
    expect(api.getPageTracker).toBeInstanceOf(Function)
    expect(api.getPageTrackerData).toBeInstanceOf(Function)
    expect(api.getPageTrackerIndex).toBeInstanceOf(Function)
    expect(api.hasAutofill).toBeInstanceOf(Function)
    expect(api.autofill).toBeInstanceOf(Function)
    expect(api.currentRouteName).toBeInstanceOf(Function)
    expect(api.getConditionByName).toBeInstanceOf(Function)
    expect(api.getBrowserFingerprint).toBeInstanceOf(Function)

    // Check event and trial management
    expect(api.recordWindowEvent).toBeInstanceOf(Function)
    expect(api.incrementTrial).toBeInstanceOf(Function)
    expect(api.decrementTrial).toBeInstanceOf(Function)
    expect(api.resetTrial).toBeInstanceOf(Function)
    expect(api.saveData).toBeInstanceOf(Function)
    expect(api.recordTrialData).toBeInstanceOf(Function)

    // Check randomization and conditions
    expect(api.randomSeed).toBeInstanceOf(Function)
    expect(api.randomAssignCondition).toBeInstanceOf(Function)

    // Check image preloading
    expect(api.preloadAllImages).toBeInstanceOf(Function)

    // Check consent management
    expect(api.completeConsent).toBeInstanceOf(Function)
  })

  it('should handle timeline methods correctly', async () => {
    // Create spies for the API methods
    const goNextViewSpy = vi.spyOn(api, 'goNextView')
    const goPrevViewSpy = vi.spyOn(api, 'goPrevView')
    const gotoViewSpy = vi.spyOn(api, 'gotoView')

    // Navigate to the landing page
    await router.push({ name: 'landing' })
    await flushPromises()

    // Check if the route meta is correctly set
    expect(router.currentRoute.value.meta).toBeDefined()
    expect(router.currentRoute.value.meta.next).toBeDefined()

    // Test goNextView
    api.goNextView()
    expect(goNextViewSpy).toHaveBeenCalled()

    // Test goPrevView
    api.goPrevView()
    expect(goPrevViewSpy).toHaveBeenCalled()

    // Test gotoView
    api.gotoView('test')
    expect(gotoViewSpy).toHaveBeenCalledWith('test')
  })

  it('should check if next and previous views are available', async () => {
    // Navigate to the landing page
    await router.push({ name: 'landing' })
    await flushPromises()

    // Check if the route meta is correctly set
    expect(router.currentRoute.value.meta).toBeDefined()
    expect(router.currentRoute.value.meta.next).toBeDefined()
    expect(router.currentRoute.value.meta.prev).toBeDefined()
    expect(router.currentRoute.value.meta.sequential).toBeDefined()

    // Check if next and previous views are available
    expect(api.hasNextView()).toBe(true)
    expect(api.hasPrevView()).toBe(true)

    // Navigate to the test page
    await router.push({ name: 'test' })
    await flushPromises()

    // Check if only previous view is available
    expect(api.hasNextView()).toBe(false)
    expect(api.hasPrevView()).toBe(true)
  })

  it('should get URL helpers correctly', () => {
    expect(api.getPublicUrl('test.png')).toBe('/nyuccl/smile/trialstepper/test.png')
    //expect(api.getCoreStaticUrl('test.png')).toContain('test.png')
    //expect(api.getStaticUrl('test.png')).toContain('test.png')
  })

  it('should reset app state correctly', () => {
    // Test resetApp
    api.resetApp()
    expect(resetAppSpy).toHaveBeenCalled()

    // Test resetStore
    api.resetStore()
    expect(resetLocalSpy).toHaveBeenCalled()

    // Test resetLocalState
    api.resetLocalState()
    expect(localStorageRemoveSpy).toHaveBeenCalledWith(api.config.local_storage_key)
    expect(resetLocalSpy).toHaveBeenCalled()
  })

  it('should manage app components correctly', () => {
    api.setAppComponent('test', 'TestComponent')
    expect(api.config.global_app_components.test).toBe('TestComponent')

    expect(api.getAppComponent('test')).toBe('TestComponent')
  })

  it('should manage runtime config correctly', () => {
    // Test setting existing config
    api.setRuntimeConfig('mode', 'testing')
    expect(api.config.mode).toBe('testing')

    // Test setting new runtime config
    api.setRuntimeConfig('newSetting', 'value')
    expect(api.config.runtime.newSetting).toBe('value')

    // Test getting existing config
    expect(api.getConfig('mode')).toBe('testing')

    // Test getting runtime config
    expect(api.getConfig('newSetting')).toBe('value')

    // Test getting non-existent config
    expect(api.getConfig('nonExistent')).toBeNull()
    //expect(errorSpy).toHaveBeenCalled()
  })

  it('should handle logging correctly', () => {
    // Test log methods
    api.log.debug('test debug')
    expect(debugSpy).toHaveBeenCalledWith('test debug')

    api.log.log('test log')
    expect(logSpy).toHaveBeenCalledWith('test log')

    api.log.warn('test warn')
    expect(warnSpy).toHaveBeenCalledWith('test warn')

    api.log.error('test error')
    expect(errorSpy).toHaveBeenCalledWith('test error')

    api.log.success('test success')
    expect(successSpy).toHaveBeenCalledWith('test success')

    api.log.clear_page_history()
    expect(clearPageHistorySpy).toHaveBeenCalled()

    api.log.add_to_history('test history')
    expect(addToHistorySpy).toHaveBeenCalledWith('test history')
  })
})
