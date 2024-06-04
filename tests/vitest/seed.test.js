/* eslint-disable no-undef */
import '@/core/seed'
import Timeline from '@/core/timeline'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHashHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import seedrandom from 'seedrandom'

let router
let pinia

describe('Seed tests', () => {
  // set up the app
  function setupapp(routes) {
    const TestAppRouter = {
      template: `<h1>hi</h1><router-view></router-view>`,
    }
    pinia = createTestingPinia({ stubActions: true })

    router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    const wrapper = mount(TestAppRouter, {
      global: {
        plugins: [router, pinia],
      },
    })
    return wrapper
  }

  it('should save automatic seed to smilestore.local.seedID', async () => {
    const MockComponent = { template: '<div>Mock Component</div>' }

    const timeline = new Timeline()
    timeline.pushSeqRoute({
      path: '/',
      name: 'first',
      component: MockComponent,
    })
    timeline.pushSeqRoute({
      path: '/second',
      name: 'second',
      component: MockComponent,
    })

    timeline.build()
    const { routes } = timeline

    const wrapper = setupapp(routes)
    await router.isReady()

    const smilestore = useSmileStore() // uses the testing pinia!

    // expect seed to not be an empty string
    expect(smilestore.local.seedID).not.toEqual('')
  })

  it('should reproduce same random number when seed is reset', () => {
    seedrandom('testseed', { global: true })
    const testrand1 = Math.random()

    seedrandom('testseed', { global: true })
    const testrand2 = Math.random()

    expect(testrand1).toBe(testrand2)
  })
})
