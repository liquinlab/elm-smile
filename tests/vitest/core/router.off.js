/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { plugin, defaultConfig, reset } from '@formkit/vue'
import '@/core/icons' // configure fontawesome
import { useRouter } from '@/core/router'

//import useSmileStore from '@/core/stores/smilestore'
import appconfig from '@/core/config'

let router
let pinia

//import axios from 'axios'
// vi.mock('axios', () => {
//   return {
//     default: {
//       get: vi.fn(() => Promise.resolve({ data: '127.0.0.1' })),
//     },
//   }
// })

/* general purpose helper functions */
// sets up app and the mock dom
function setupapp() {
  const TestComponent = {
    template: `<h1>hi</h1>`,
  }
  pinia = createTestingPinia({ stubActions: true })
  setActivePinia(pinia)

  const routes = [
    {
      path: '/',
      name: 'welcome_anonymous',
      component: TestComponent,
    },
    {
      path: '/welcome',
      name: 'welcome_anonymous2',
      component: TestComponent,
    },
  ]

  router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  const TestAppRouter = {
    template: `<h1>hi</h1><router-view></router-view>`,
  }
  const wrapper = mount(TestAppRouter, {
    global: {
      plugins: [router, pinia],
    },
  })
  return wrapper
}

// resets the local storage.  simulates deleting it in the browser
function resetLocalStorage() {
  localStorage.setItem(appconfig.local_storage_key, null)
}

// sets a json version of data in local storage
function setLocalStorage(data) {
  localStorage.setItem(appconfig.local_storage_key, JSON.stringify(data))
}

// returns the local storage as a javascript object
function getLocalStorage() {
  return JSON.parse(localStorage.getItem(appconfig.local_storage_key))
}

/* generic router tests */
describe('Generic router tests', () => {
  beforeEach(() => {
    // Reset router and routerManager before each test
  })

  /* there are some basic sanity checks */
  it('localstorage is modified by writing to it', () => {
    expect(localStorage.getItem('test')).toBe(null)
    localStorage.setItem('test', 'test')
    expect(localStorage.getItem('test')).toBe('test')
  })

  it('localstorage survives between tests', () => {
    expect(localStorage.getItem('test')).toBe('test')
  })

  /* now test the app */
  it('there should be no smilestore before the app created', () => {
    resetLocalStorage()
    expect(getLocalStorage()).toBe(null)
  })

  it('there should be smilestore state after the app started', async () => {
    const wrapper = setupapp()
    await router.isReady()
    expect(getLocalStorage()).not.toBe(null)
  })

  it.skip('there should be no localstorage if it is reset', async () => {
    const wrapper = setupapp()
    await router.isReady()
    resetLocalStorage()
    expect(getLocalStorage()).toBe(null)
  })

  // Add more tests for RouterManager specific functionality
  // it.skip('router should properly initialize router with guards', async () => {
  //   const wrapper = setupapp()
  //   await router.isReady()

  //   // Test that guards are properly added
  //   expect(router.beforeHooks.length).toBeGreaterThan(0)
  // })

  // it.skip('router should handle seed setup', async () => {
  //   const wrapper = setupapp()
  //   await router.isReady()

  //   //routerManager.setupSeedHandling()
  //   expect(router.beforeResolveHooks.length).toBeGreaterThan(0)
  // })

  // it.skip('router should handle preload setup', async () => {
  //   const wrapper = setupapp()
  //   await router.isReady()

  //   //router.setupPreloadHandling()
  //   expect(router.afterHooks.length).toBeGreaterThan(0)
  // })
})

// describe.skip('Testing page reloads', () => {
//   it('should redirect you to the last route if you are known', async () => {
//     // pretend that user has localstorage set to known and /exp
//     setLocalStorage({ knownUser: true, lastRoute: 'exp' })

//     // double check that worked
//     expect(getLocalStorage().lastRoute).toBe('exp')
//     expect(getLocalStorage().knownUser).toBe(true)

//     // great app (close to opening browser)
//     pinia = createTestingPinia({ stubActions: false })
//     router = createRouter({
//       history: createWebHashHistory(),
//       routes,
//     })
//     addGuards(router)
//     const wrapper = setupapp() // create the app
//     router.push('/')
//     // still the same?
//     expect(getLocalStorage().lastRoute).toBe('exp')
//     expect(getLocalStorage().knownUser).toBe(true)

//     // did the smilestore load that?
//     const smilestore = useSmileStore()
//     expect(smilestore.lastRoute).toBe('exp') // should be exp
//     expect(smilestore.isKnownUser).toBe(true) // should be true

//     await new Promise((r) => setTimeout(r, 10)) // wait a bit for the page to update and render after the click
//     expect(router.currentRoute.value.name).toBe('exp') // yes this
//   })

//   // there's not way to redirect to welcome_anonymous if you are unknown and known to not be a referral currently
//   // it('should redirect you to welcome_anonymous if you are unknown and accessed from an anonymous welcome', async () => {})

//   it('should send you to the last route if you are known and you try to access a different route', async () => {
//     // pretend that user has localstorage set to known and /exp
//     setLocalStorage({ knownUser: true, lastRoute: 'exp' })

//     // double check that worked
//     expect(getLocalStorage().lastRoute).toBe('exp')
//     expect(getLocalStorage().knownUser).toBe(true)

//     // great app (close to opening browser)
//     pinia = createTestingPinia({ stubActions: false })
//     router = createRouter({
//       history: createWebHashHistory(),
//       routes,
//     })
//     addGuards(router)
//     const wrapper = setupapp() // create the app
//     router.push('/debrief') // try to access debrief instead
//     // still the same?
//     expect(getLocalStorage().lastRoute).toBe('exp')
//     expect(getLocalStorage().knownUser).toBe(true)

//     // did the smilestore load that?
//     const smilestore = useSmileStore()
//     expect(smilestore.lastRoute).toBe('exp') // should be exp
//     expect(smilestore.isKnownUser).toBe(true) // should be true

//     await new Promise((r) => setTimeout(r, 10)) // wait a bit for the page to update and render after the click
//     expect(router.currentRoute.value.name).toBe('exp') // yes this
//   })
// })
