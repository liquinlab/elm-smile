import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, createApp } from 'vue'
import { createTestingPinia } from '@pinia/testing'
//import { setActivePinia, createPinia } from 'pinia'
import '../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../setup/mocks'

// Import the actual router (not mocked) after the timeline mock is set up
import useAPI from '@/core/composables/useAPI'
import Timeline from '@/core/timeline'
import { useRouter, addGuards } from '@/core/router'

// Helper function to create a timeline with test routes
function createTestTimeline() {
  // Create a minimal mock API that satisfies Timeline's requirements
  const mockMiniAPI = {
    config: {
      mode: 'development',
      local_storage_key: 'test_storage',
    },
    log: {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
    },
    store: {
      getRandomizedRouteByName: vi.fn().mockReturnValue(null),
      setRandomizedRoute: vi.fn(),
      registerPageTracker: vi.fn(),
      config: {
        mode: 'development',
      },
      local: {
        seqtimeline: [],
        routes: [],
      },
    },
    sampleWithReplacement: vi.fn((options) => [options[0]]), // Returns first option by default
    getConditionByName: vi.fn(),
    randomAssignCondition: vi.fn((options) => options.conditionname[0]), // Returns first condition by default
  }

  const timeline = new Timeline(mockMiniAPI)

  // Create a mock component for routes
  const MockComponent = (text = 'Mock Component') =>
    defineComponent({
      template: `<div>${text}</div>`,
    })

  // Add welcome_anonymous route (required by Timeline)
  timeline.pushSeqView({
    path: '/welcome',
    name: 'welcome_anonymous',
    component: MockComponent('Welcome Anonymous'),
    meta: {
      prev: undefined,
      next: 'consent',
      allowAlways: true,
      requiresConsent: false,
    },
  })

  // Add welcome_referred route
  timeline.pushSeqView({
    path: '/welcome/:service',
    name: 'welcome_referred',
    component: MockComponent('Welcome Referred'),
    meta: {
      prev: undefined,
      next: 'consent',
      allowAlways: true,
      requiresConsent: false,
    },
  })

  // Add consent route
  timeline.pushSeqView({
    path: '/consent',
    name: 'consent',
    component: MockComponent('Consent'),
    meta: {
      requiresConsent: false,
      setConsented: true,
    },
  })

  // Add demograph route
  timeline.pushSeqView({
    path: '/demograph',
    name: 'demograph',
    component: MockComponent('Demograph'),
  })

  // Add instructions route
  timeline.pushSeqView({
    path: '/instructions',
    name: 'instructions',
    component: MockComponent('Instructions'),
  })

  // Add quiz route
  timeline.pushSeqView({
    path: '/quiz',
    name: 'quiz',
    component: MockComponent('Quiz'),
  })

  // Add experiment route
  timeline.pushSeqView({
    path: '/experiment',
    name: 'exp',
    component: MockComponent('Experiment'),
  })

  // Add debrief route
  timeline.pushSeqView({
    path: '/debrief',
    name: 'debrief',
    component: MockComponent('Debrief'),
  })

  // Add feedback route
  timeline.pushSeqView({
    path: '/feedback',
    name: 'feedback',
    component: MockComponent('Feedback'),
    meta: {
      setDone: true,
    },
  })

  // Add always allowed route
  timeline.registerView({
    path: '/always_allow',
    name: 'always_allow',
    component: MockComponent('Always Allow'),
    meta: {
      allowAlways: true,
      requiresConsent: false,
    },
  })

  // Add thanks route
  timeline.pushSeqView({
    path: '/thanks',
    name: 'thanks',
    component: MockComponent('Thanks'),
    meta: {
      requiresDone: true,
      //resetApp: api.getConfig('allow_repeats'),
    },
  })

  // Add withdraw route
  timeline.registerView({
    path: '/withdraw',
    name: 'withdraw',
    component: MockComponent('Withdraw'),
    meta: {
      requiresWithdraw: true,
      //resetApp: api.getConfig('allow_repeats'),
    },
  })

  // Build the timeline
  timeline.build()

  return timeline
}

const TestComponent = defineComponent({
  setup() {
    const api = useAPI()
    return { api }
  },
  template: `
    <div class="test-wrapper">
      <router-view></router-view>
    </div>
  `,
})

describe('useRouter', () => {
  let wrapper
  let router
  let timeline
  let api
  let completeConsentSpy
  let resetAppSpy

  beforeAll(() => {
    setupBrowserEnvironment()
  })

  beforeEach(async () => {
    vi.clearAllMocks()

    // Create timeline first
    timeline = createTestTimeline()

    // Initialize router
    router = await useRouter(timeline)

    // Create pinia instance
    const pinia = createTestingPinia()

    // Mount the component with both router and pinia
    wrapper = mount(TestComponent, {
      global: {
        plugins: [router, pinia],
        stubs: {},
        components: {
          FAIcon: {
            name: 'FAIcon',
            render() {
              return h('i', { class: 'mock-icon' }, 'icon')
            },
          },
        },
      },
    })

    await router.isReady()

    // Get API instance
    api = wrapper.vm.api

    // Add guards with the API instance from the component
    addGuards(router, api)

    // Add spy on completeConsent
    completeConsentSpy = vi.spyOn(api, 'completeConsent')
    resetAppSpy = vi.spyOn(api, 'resetApp')

    // Force a route to ensure router is working
    await router.push('/welcome')
    await flushPromises()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render router view', async () => {
    //console.log('Router current route:', router.currentRoute.value)
    //console.log('Rendered HTML:', wrapper.html())
    expect(wrapper.html()).toContain('test-wrapper')
    expect(wrapper.html()).toContain('Welcome Anonymous')
  })

  it('should create a router with the correct routes', async () => {
    expect(router).toBeDefined()
    const routes = router.getRoutes()
    expect(routes.length).toBeGreaterThan(0)

    // Check that all routes from the timeline are in the router
    timeline.routes.forEach((route) => {
      const routerRoute = routes.find((r) => r.name === route.name)
      expect(routerRoute).toBeDefined()
      expect(routerRoute.path).toBe(route.path)
    })
  })

  it('should navigate between routes', async () => {
    // Start at welcome
    await api.gotoView('welcome_anonymous')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('welcome_anonymous')
    expect(wrapper.html()).toContain('Welcome Anonymous')

    // Navigate to consent
    await api.gotoView('consent')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('consent')
    expect(wrapper.html()).toContain('Consent')
  })

  it('show allow navigation to routes with allowAlways=true', async () => {
    await api.gotoView('welcome_anonymous')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('welcome_anonymous')
    expect(wrapper.html()).toContain('Welcome Anonymous')

    await api.gotoView('always_allow')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('always_allow')
  })

  it.only('should set user as consented when navigating from a route with setConsented=true', async () => {
    await api.gotoView('welcome_anonymous')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('welcome_anonymous')
    expect(wrapper.html()).toContain('Welcome Anonymous')

    await api.gotoView('consent')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('consent')
    expect(wrapper.html()).toContain('Consent')

    // Now navigate away from consent to trigger the guard
    await api.gotoView('demograph')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('demograph')
    expect(wrapper.html()).toContain('Demograph')

    //expect(api.isResetApp).toHaveBeenCalled()
    expect(api.isResetApp()).toBe(false)
    //expect(resetAppSpy).toHaveBeenCalled()

    //api.completeConsent()
    expect(api.store.inGuards).toBe(true)
    expect(completeConsentSpy).toHaveBeenCalled()
  })
})
