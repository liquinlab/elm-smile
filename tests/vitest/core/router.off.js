/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { plugin, defaultConfig, reset } from '@formkit/vue'
import '@/core/icons' // configure fontawesome
import { createApp } from 'vue'
import { setActivePinia } from 'pinia'

import App from '@/core/App.vue'
import { routes, addGuards } from '@/core/router'
import useSmileStore from '@/core/stores/smilestore'
import appconfig from '@/core/config'
import Timeline from '@/core/timeline'
import useAPI from '@/core/composables/useAPI'

let router
let pinia
let api
let timeline
let app

// Mock components for testing
const WelcomeAnonymous = { template: '<div>Please help us</div>' }
const WelcomeReferred = { template: '<div>Please help us</div>' }
const Consent = { template: '<div>Please take the time to read</div>' }

// Mock API
vi.mock('@/core/composables/useAPI', () => ({
  default: () => ({
    config: {
      mode: 'production',
    },
    log: {
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      log: vi.fn(),
    },
    store: {
      getRandomizedRouteByName: vi.fn(),
      setRandomizedRoute: vi.fn(),
      registerPageTracker: vi.fn(),
      config: { mode: 'production' },
      local: {},
    },
  }),
}))

vi.mock('axios', () => ({
  get: vi.fn(() => Promise.resolve({ data: '127.0.0.1' })),
}))

/* general purpose helper functions */
function setupapp() {
  // Create a new Vue app instance
  app = createApp(App)

  // Install plugins
  app.use(pinia)
  app.use(router)
  app.use(plugin, defaultConfig)

  const wrapper = mount(App, {
    global: {
      plugins: [router, pinia, [plugin, defaultConfig]],
      stubs: ['FAIcon'],
    },
  })
  return wrapper
}

function resetLocalStorage() {
  localStorage.clear()
  localStorage.setItem(appconfig.local_storage_key, null)
}

function setLocalStorage(data) {
  localStorage.setItem(appconfig.local_storage_key, JSON.stringify(data))
}

function getLocalStorage() {
  return JSON.parse(localStorage.getItem(appconfig.local_storage_key))
}

describe.skip('Generic router tests', () => {
  beforeEach(async () => {
    // Reset localStorage before each test
    resetLocalStorage()

    // Create pinia store
    pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        smile: {
          local: {
            lastRoute: null,
            knownUser: false,
          },
        },
      },
    })

    // Set active pinia instance
    setActivePinia(pinia)

    // Create new timeline with test routes
    timeline = new Timeline(useAPI())

    // Add test routes
    timeline.pushSeqView({
      path: '/welcome',
      name: 'welcome_anonymous',
      component: WelcomeAnonymous,
      meta: { allowAlways: true },
    })

    timeline.pushSeqView({
      path: '/welcome/referred',
      name: 'welcome_referred',
      component: WelcomeReferred,
      meta: { allowAlways: true },
    })

    timeline.pushSeqView({
      path: '/consent',
      name: 'consent',
      component: Consent,
    })

    timeline.build()

    // Create router with timeline routes
    router = createRouter({
      history: createWebHashHistory(),
      routes: timeline.routes,
    })
    addGuards(router)

    // Wait for router to be ready
    await router.isReady()
  })

  afterEach(() => {
    // Clean up
    if (app) {
      app.unmount()
    }
  })

  /* Basic localStorage tests */
  it('localstorage is modified by writing to it', () => {
    localStorage.setItem('test', 'test')
    expect(localStorage.getItem('test')).toBe('test')
  })

  it('localstorage survives between tests', () => {
    expect(localStorage.getItem('test')).toBe('test')
  })

  /* App and router tests */
  it('there should be no smilestore before the app created', () => {
    resetLocalStorage()
    expect(getLocalStorage()).toBe(null)
  })

  it('there should be smilestore state after the app started', async () => {
    const wrapper = setupapp()
    await router.isReady()
    await flushPromises()
    expect(getLocalStorage()).not.toBe(null)
  })

  it('there should be no localstorage if it is reset', async () => {
    const wrapper = setupapp()
    await router.isReady()
    await flushPromises()
    resetLocalStorage()
    expect(getLocalStorage()).toBe(null)
  })

  /* Route navigation tests */
  it('should render welcome_anonymous when accessing /', async () => {
    const wrapper = setupapp()
    const smilestore = useSmileStore()
    resetLocalStorage()

    await router.push('/')
    await router.isReady()
    await flushPromises()

    expect(wrapper.html()).toContain('Please help us')
    expect(smilestore.local.lastRoute).toBe('welcome_anonymous')
    expect(router.currentRoute.value.name).toBe('welcome_anonymous')
  })

  it('should render welcome_referred when accessing a prolific route', async () => {
    const wrapper = setupapp()
    const smilestore = useSmileStore()
    resetLocalStorage()

    await router.push('/welcome/prolific?test=test')
    await router.isReady()
    await flushPromises()

    expect(wrapper.html()).toContain('Please help us')
    expect(smilestore.local.lastRoute).toBe('welcome_referred')
    expect(router.currentRoute.value.name).toBe('welcome_referred')
  })

  it('should render welcome_referred when accessing a cloudresearch route', async () => {
    const wrapper = setupapp()
    const smilestore = useSmileStore()
    resetLocalStorage()

    await router.push('/welcome/cloudresearch?test=test')
    await router.isReady()
    await flushPromises()

    expect(wrapper.html()).toContain('Please help us')
    expect(smilestore.local.lastRoute).toBe('welcome_referred')
    expect(router.currentRoute.value.name).toBe('welcome_referred')
  })

  it('should render welcome_referred when accessing an amt route', async () => {
    const wrapper = setupapp()
    const smilestore = useSmileStore()
    resetLocalStorage()

    await router.push('/welcome/mturk?test=test')
    await router.isReady()
    await flushPromises()

    expect(wrapper.html()).toContain('Please help us')
    expect(smilestore.local.lastRoute).toBe('welcome_referred')
  })

  it('should render welcome_referred when accessing a citizenscience route', async () => {
    const wrapper = setupapp()
    const smilestore = useSmileStore()
    resetLocalStorage()

    await router.push('/welcome/mturk?test=test')
    await router.isReady()
    await flushPromises()

    expect(wrapper.html()).toContain('Please help us')
    expect(smilestore.local.lastRoute).toBe('welcome_referred')
    expect(router.currentRoute.value.name).toBe('welcome_referred')
  })

  it('should render welcome_anonymous when accessing / then the informed consent after a click', async () => {
    const wrapper = setupapp()
    const smilestore = useSmileStore()
    resetLocalStorage()

    await router.push('/')
    await router.isReady()
    await flushPromises()

    expect(wrapper.html()).toContain('Please help us')
    expect(smilestore.local.lastRoute).toBe('welcome_anonymous')

    await wrapper.find('#begintask').trigger('click')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 10))

    expect(wrapper.html()).toContain('Please take the time to read')
    expect(smilestore.local.lastRoute).toBe('consent')
  })
})

describe('Testing page reloads', () => {
  beforeEach(async () => {
    // Reset localStorage before each test
    resetLocalStorage()

    // Create new timeline with test routes
    timeline = new Timeline(useAPI())

    // Add test routes
    timeline.pushSeqView({
      path: '/welcome',
      name: 'welcome_anonymous',
      component: WelcomeAnonymous,
      meta: { allowAlways: true },
    })

    timeline.pushSeqView({
      path: '/exp',
      name: 'exp',
      component: { template: '<div>Experiment</div>' },
    })

    timeline.build()

    // Create pinia store
    pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        smile: {
          local: {
            lastRoute: null,
            knownUser: false,
          },
        },
      },
    })

    // Set active pinia instance
    setActivePinia(pinia)

    // Create router with timeline routes
    router = createRouter({
      history: createWebHashHistory(),
      routes: timeline.routes,
    })
    addGuards(router)

    // Wait for router to be ready
    await router.isReady()
  })

  afterEach(() => {
    // Clean up
    if (app) {
      app.unmount()
    }
  })

  it('should redirect you to the last route if you are known', async () => {
    setLocalStorage({ knownUser: true, lastRoute: 'exp' })

    expect(getLocalStorage().lastRoute).toBe('exp')
    expect(getLocalStorage().knownUser).toBe(true)

    const wrapper = setupapp()
    const smilestore = useSmileStore()

    await router.push('/')
    await router.isReady()
    await flushPromises()

    expect(getLocalStorage().lastRoute).toBe('exp')
    expect(getLocalStorage().knownUser).toBe(true)
    expect(smilestore.lastRoute).toBe('exp')
    expect(smilestore.isKnownUser).toBe(true)
    expect(router.currentRoute.value.name).toBe('exp')
  })

  it('should send you to the last route if you are known and you try to access a different route', async () => {
    setLocalStorage({ knownUser: true, lastRoute: 'exp' })

    expect(getLocalStorage().lastRoute).toBe('exp')
    expect(getLocalStorage().knownUser).toBe(true)

    const wrapper = setupapp()
    const smilestore = useSmileStore()

    await router.push('/debrief')
    await router.isReady()
    await flushPromises()

    expect(getLocalStorage().lastRoute).toBe('exp')
    expect(getLocalStorage().knownUser).toBe(true)
    expect(smilestore.lastRoute).toBe('exp')
    expect(smilestore.isKnownUser).toBe(true)
    expect(router.currentRoute.value.name).toBe('exp')
  })
})
