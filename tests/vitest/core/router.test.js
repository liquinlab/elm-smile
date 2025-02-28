import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, createApp } from 'vue'
import { createTestingPinia } from '@pinia/testing'
import '../setup/mocks' // Import shared mocks
import { setupBrowserEnvironment } from '../setup/mocks'

// Import the actual router (not mocked) after the timeline mock is set up
import useAPI from '@/core/composables/useAPI'
import Timeline from '@/core/timeline'
import { useRouter } from '@/core/router'

// Helper function to create a timeline with test routes
function createTestTimeline() {
  const timeline = new Timeline(useAPI())

  // Create a mock component for routes
  const MockComponent = defineComponent({
    template: '<div>Mock Component</div>',
  })

  // Add welcome_anonymous route (required by Timeline)
  timeline.pushSeqView({
    path: '/welcome',
    name: 'welcome_anonymous',
    component: MockComponent,
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
    component: MockComponent,
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
    component: MockComponent,
    meta: {
      requiresConsent: false,
      setConsented: true,
    },
  })

  // Add demograph route
  timeline.pushSeqView({
    path: '/demograph',
    name: 'demograph',
    component: MockComponent,
  })

  // Add instructions route
  timeline.pushSeqView({
    path: '/instructions',
    name: 'instructions',
    component: MockComponent,
  })

  // Add quiz route
  timeline.pushSeqView({
    path: '/quiz',
    name: 'quiz',
    component: MockComponent,
  })

  // Add experiment route
  timeline.pushSeqView({
    path: '/experiment',
    name: 'exp',
    component: MockComponent,
  })

  // Add debrief route
  timeline.pushSeqView({
    path: '/debrief',
    name: 'debrief',
    component: MockComponent,
  })

  // Add feedback route
  timeline.pushSeqView({
    path: '/feedback',
    name: 'feedback',
    component: MockComponent,
    meta: {
      setDone: true,
    },
  })

  // Add always allowed route
  timeline.registerView({
    path: '/always_allow',
    name: 'always_allow',
    component: MockComponent,
    meta: {
      allowAlways: true,
      requiresConsent: false,
    },
  })

  // Add thanks route
  timeline.pushSeqView({
    path: '/thanks',
    name: 'thanks',
    component: MockComponent,
    meta: {
      requiresDone: true,
      //resetApp: api.getConfig('allow_repeats'),
    },
  })

  // Add withdraw route
  timeline.registerView({
    path: '/withdraw',
    name: 'withdraw',
    component: MockComponent,
    meta: {
      requiresWithdraw: true,
      //resetApp: api.getConfig('allow_repeats'),
    },
  })

  // Build the timeline
  timeline.build()

  return timeline
}

const RouterTest = defineComponent({
  setup() {},
  template: `
    <router-view></router-view>
  `,
})

describe('useRouter', () => {
  let wrapper
  let testApp
  let api
  let router
  let timeline

  // Create a minimal app to provide context for useRouter
  const createTestApp = async () => {
    const app = createApp({})
    const pinia = createTestingPinia()
    const timeline = createTestTimeline()
    const router = await useRouter(timeline) // This will now use the real router code with our mocked timeline
    app.use(pinia)
    app.use(router)
    return { app, router }
  }

  beforeAll(() => {
    //setActivePinia(createPinia())
    setupBrowserEnvironment()
  })

  beforeEach(async () => {
    // Create the test app with router
    testApp = await createTestApp()
    api = testApp.api
    router = testApp.router
    timeline = createTestTimeline() // ground truth timeline

    try {
      wrapper = shallowMount(RouterTest, {
        global: {
          plugins: [testApp.router],
        },
      })
    } catch (e) {
      console.error('Failed to mount component:', e)
    }
  })

  // Clean up after tests
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  // Test basic router creation
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

  it.skip('should allow navigation to routes with allowAlways=true', async () => {
    await router.push({ name: 'welcome_anonymous' })
    await flushPromises()

    expect(api.store.setLastRoute).toHaveBeenCalledWith('welcome_anonymous')
    expect(api.store.recordRoute).toHaveBeenCalledWith('welcome_anonymous')
  })

  // Test consent-related navigation
  it.skip('should set user as consented when navigating from a route with setConsented=true', async () => {
    await router.push({ name: 'welcome_anonymous' })
    await flushPromises()

    await router.push({ name: 'consent' })
    await flushPromises()

    // Now navigate away from consent to trigger the guard
    await router.push({ name: 'demograph' })
    await flushPromises()

    expect(mockAPI.completeConsent).toHaveBeenCalled()
  })
})
