/* eslint-disable no-undef */
// general testing functions
import { defineComponent, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'

// import shared mocks
import '../../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../../setup/mocks'

// import the composable
import useAPI from '@/core/composables/useAPI'

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
  let router
  let wrapper
  let api

  beforeAll(() => {
    setupBrowserEnvironment()
  })

  beforeEach(() => {
    // Reset mock state
    vi.clearAllMocks()

    // Create a fresh router for each test
    router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    // Create a fresh pinia for each test with initial state

    // Create pinia instance
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
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

    // Create spies for all methods
    vi.spyOn(api.log, 'debug')
    vi.spyOn(api.log, 'log')
    vi.spyOn(api.log, 'warn')
    vi.spyOn(api.log, 'error')
    vi.spyOn(api.log, 'success')
    vi.spyOn(api.log, 'clearPageHistory')
    vi.spyOn(api.log, 'addToHistory')
    vi.spyOn(api.store, 'resetApp')
    vi.spyOn(api.store, 'resetLocal')
    vi.spyOn(window.localStorage, 'removeItem')
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
    // expect(api.store.local).toBeDefined()
    // expect(api.store.global).toBeDefined()
    // expect(api.store.dev).toBeDefined()

    // Check router related methods
    expect(api.route).toBeDefined()
    expect(api.router).toBeDefined()
    expect(api.goNextView).toBeInstanceOf(Function)
    expect(api.goPrevView).toBeInstanceOf(Function)
    expect(api.goToView).toBeInstanceOf(Function)
    expect(api.hasNextView).toBeInstanceOf(Function)
    expect(api.hasPrevView).toBeInstanceOf(Function)

    // Check randomization utilities
    expect(api.faker).toBeDefined()
    expect(api.randomInt).toBeInstanceOf(Function)
    expect(api.shuffle).toBeInstanceOf(Function)
    expect(api.sampleWithReplacement).toBeInstanceOf(Function)
    expect(api.sampleWithoutReplacement).toBeInstanceOf(Function)

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
    expect(api.recordForm).toBeInstanceOf(Function)
    expect(api.recordProperty).toBeInstanceOf(Function)

    // Check browser checks
    expect(api.isBrowserTooSmall).toBeInstanceOf(Function)
    expect(api.verifyVisibility).toBeInstanceOf(Function)
    expect(api.getVerifiedVisibility).toBeInstanceOf(Function)

    // Check development tools
    expect(api.setAutofill).toBeInstanceOf(Function)
    expect(api.removeAutofill).toBeInstanceOf(Function)

    // Check completion and recruitment
    expect(api.setCompletionCode).toBeInstanceOf(Function)
    expect(api.getRecruitmentService).toBeInstanceOf(Function)

    expect(api.hasAutofill).toBeInstanceOf(Function)
    expect(api.autofill).toBeInstanceOf(Function)
    expect(api.currentRouteName).toBeInstanceOf(Function)
    expect(api.getConditionByName).toBeInstanceOf(Function)
    expect(api.getBrowserFingerprint).toBeInstanceOf(Function)

    // Check event and trial management
    expect(api.recordWindowEvent).toBeInstanceOf(Function)

    // Check data and save methods
    expect(api.saveData).toBeInstanceOf(Function)
    expect(api.recordData).toBeInstanceOf(Function)

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
    const gotoViewSpy = vi.spyOn(api, 'goToView')

    // Navigate to the landing page
    api.goToView('landing')
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
    api.goToView('test')
    expect(gotoViewSpy).toHaveBeenCalledWith('test')
  })

  it('should check if next and previous views are available', async () => {
    // Navigate to the landing page
    api.goToView('landing')
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

    api.goToView('test')
    await flushPromises()

    // Check if only previous view is available
    expect(api.hasNextView()).toBe(false)
    expect(api.hasPrevView()).toBe(true)
  })

  it('should get URL helpers correctly', () => {
    expect(api.getPublicUrl('test.png')).toMatch(/^\/[^/]+\/[^/]+\/[^/]+\/test\.png$/)
    //expect(api.getCoreStaticUrl('test.png')).toContain('test.png')
    //expect(api.getStaticUrl('test.png')).toContain('test.png')
  })

  it('should reset app state correctly', () => {
    // Test resetApp
    api.resetApp()
    expect(api.store.resetApp).toHaveBeenCalled()

    // Test resetStore
    api.resetStore()
    expect(api.store.resetLocal).toHaveBeenCalled()

    // Test resetLocalState
    api.resetLocalState()
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(api.config.localStorageKey)
    expect(api.store.resetLocal).toHaveBeenCalled()
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
    expect(api.log.debug).toHaveBeenCalledWith('test debug')

    api.log.log('test log')
    expect(api.log.log).toHaveBeenCalledWith('test log')

    api.log.warn('test warn')
    expect(api.log.warn).toHaveBeenCalledWith('test warn')

    api.log.error('test error')
    expect(api.log.error).toHaveBeenCalledWith('test error')

    api.log.success('test success')
    expect(api.log.success).toHaveBeenCalledWith('test success')

    api.log.clearPageHistory()
    expect(api.log.clearPageHistory).toHaveBeenCalled()

    api.log.addToHistory('test history')
    expect(api.log.addToHistory).toHaveBeenCalledWith('test history')
  })
})
