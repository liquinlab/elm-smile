/* eslint-disable no-undef */
import RandomizeSubTimeline from '@/core/subtimeline'
import Timeline from '@/core/timeline'
import { createTestingPinia, setActivePinia } from '@pinia/testing'
import useSmileStore from '@/core/stores/smilestore'
import { createRouter, createWebHashHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
// import axios from 'axios'

// vi.mock('axios', () => ({
//   get: vi.fn(() => Promise.resolve({ data: '127.0.0.1' })),
// }))

let router
let pinia

describe('Subtimeline tests', () => {
  // set up the app
  function setupapp(routes) {
    const TestAppRouter = {
      template: `<h1>hi</h1><router-view></router-view>`,
    }
    pinia = createTestingPinia({ stubActions: true })
    setActivePinia(pinia)
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

  it('should be able to create a subtimline', () => {
    const subtimeline = new RandomSubTimeline()
    expect(subtimeline).toBeDefined()
  })

  it('should add a route to subtimeline', () => {
    const MockComponent = { template: '<div>Mock Component</div>' }
    const subtimeline = new RandomSubTimeline()
    subtimeline.registerView({
      path: '/',
      name: 'index',
      component: MockComponent,
    })
    expect(subtimeline.routes.length).toBe(1)
  })

  it('should leave next and prev undefined but meta defined', () => {
    const MockComponent = { template: '<div>Mock Component</div>' }
    const subtimeline = new RandomSubTimeline()
    subtimeline.registerView({
      path: '/',
      name: 'index',
      component: MockComponent,
      // meta: { prev: 'prev', next: 'next' },
    })
    expect(subtimeline.routes[0].meta).toBeDefined()
    expect(subtimeline.routes[0].meta.next).toBe(undefined)
    expect(subtimeline.routes[0].meta.prev).toBe(undefined)
  })

  it('should raise an error if you try to specify next or prev', () => {
    const MockComponent = { template: '<div>Mock Component</div>' }
    const subtimeline = new RandomSubTimeline()
    const errorTrigger = () => {
      subtimeline.registerView({
        path: '/',
        name: 'index',
        component: MockComponent,
        meta: { prev: 'prev', next: 'next' },
      })
    }
    expect(errorTrigger).toThrowError()
  })

  it('should not allow the same route to be registered twice', () => {
    const MockComponent = { template: '<div>Mock Component</div>' }
    const subtimeline = new RandomSubTimeline()
    subtimeline.registerView({
      path: '/thanks',
      name: 'thank',
      component: MockComponent,
    })

    const errorTrigger = () => {
      subtimeline.registerView({
        path: '/thanks',
        name: 'thanks',
        component: MockComponent,
      })
    }
    expect(errorTrigger).toThrowError()
    expect(subtimeline.routes.length).toBe(1)
  })

  it('cannot nest subtimelines into each other', () => {
    const MockComponent1 = { template: '<div>Mock Component</div>' }
    const MockComponent2 = { template: '<div>Mock Component</div>' }
    const subtimeline1 = new RandomSubTimeline()
    const subtimeline2 = new RandomSubTimeline()
    subtimeline1.registerView({
      path: '/first',
      name: 'first',
      component: MockComponent1,
    })
    subtimeline2.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent2,
    })
    const errorTrigger = () => {
      subtimeline1.pushRandomizedTimeline({
        name: subtimeline2,
      })
    }
    expect(errorTrigger).toThrowError()
  })

  // add tests for RandomizeSubTimeline here
  it('should not allow specified conditions if condition is not set', async () => {
    const MockComponent = { template: '<div>Mock Component</div>' }

    const timeline = new Timeline()
    const subtimeline = new RandomSubTimeline()
    timeline.pushSeqView({
      path: '/',
      name: 'first',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid2',
      name: 'mid2',
      component: MockComponent,
    })
    timeline.pushRandomizedTimeline({
      name: subtimeline,
      meta: { label: 'orderCond', orders: { cond1: ['mid1', 'mid2'], cond2: ['mid2', 'mid1'] } },
    })

    timeline.pushSeqView({
      path: '/last',
      name: 'last',
      component: MockComponent,
    })

    timeline.build()
    const { routes } = timeline

    const wrapper = setupapp(routes)
    await router.isReady()

    const smilestore = useSmileStore() // uses the testing pinia!

    const errorTrigger = () => {
      RandomizeSubTimeline(timeline.seqtimeline[1].name, router)
    }
    expect(errorTrigger).toThrowError()
  })

  it('should re-order based on specified conditions if condition is set', async () => {
    const MockComponent = { template: '<div>Mock Component</div>' }

    const timeline = new Timeline()
    const subtimeline = new RandomSubTimeline()
    timeline.pushSeqView({
      path: '/',
      name: 'first',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid2',
      name: 'mid2',
      component: MockComponent,
    })
    timeline.pushRandomizedTimeline({
      name: subtimeline,
      meta: { label: 'orderCond', orders: { cond1: ['mid1', 'mid2'], cond2: ['mid2', 'mid1'] } },
    })

    timeline.pushSeqView({
      path: '/last',
      name: 'last',
      component: MockComponent,
    })

    timeline.build()
    const { routes } = timeline

    const wrapper = setupapp(routes)
    await router.isReady()

    const smilestore = useSmileStore() // uses the testing pinia!

    // first condition
    smilestore.data.conditions.orderCond = 'cond1'
    const shuffledRoutes = RandomizeSubTimeline(timeline.seqtimeline[1].name, router)

    expect(shuffledRoutes[0].name).toBe('mid1')
    expect(shuffledRoutes[1].name).toBe('mid2')

    // now the other condition
    smilestore.data.conditions.orderCond = 'cond2'
    const shuffledRoutes2 = RandomizeSubTimeline(timeline.seqtimeline[1].name, router)

    expect(shuffledRoutes2[0].name).toBe('mid2')
    expect(shuffledRoutes2[1].name).toBe('mid1')
  })

  it('should shuffle randomly if no specified conditions', async () => {
    const MockComponent = { template: '<div>Mock Component</div>' }

    const timeline = new Timeline()
    const subtimeline = new RandomSubTimeline()
    timeline.pushSeqView({
      path: '/',
      name: 'first',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid2',
      name: 'mid2',
      component: MockComponent,
    })
    timeline.pushRandomizedTimeline({
      name: subtimeline,
    })

    timeline.pushSeqView({
      path: '/last',
      name: 'last',
      component: MockComponent,
    })

    timeline.build()
    const { routes } = timeline

    const wrapper = setupapp(routes)
    await router.isReady()

    const shuffledRoutes = RandomizeSubTimeline(timeline.seqtimeline[1].name, router)

    // has to be mid1 or mid2 -- this is kind of a bad test
    expect(['mid1', 'mid2']).toContain(shuffledRoutes[0].name)
    expect(['mid1', 'mid2']).toContain(shuffledRoutes[1].name)
  })

  it('should shuffle the same way if given the same seed', async () => {
    const MockComponent = { template: '<div>Mock Component</div>' }

    const timeline = new Timeline()
    const subtimeline = new RandomSubTimeline()
    timeline.pushSeqView({
      path: '/',
      name: 'first',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid2',
      name: 'mid2',
      component: MockComponent,
    })
    timeline.pushRandomizedTimeline({
      name: subtimeline,
    })

    timeline.pushSeqView({
      path: '/last',
      name: 'last',
      component: MockComponent,
    })

    async function doEverything() {
      timeline.build()
      const { routes } = timeline

      const wrapper = setupapp(routes)
      await router.isReady()

      const smilestore = useSmileStore() // uses the testing pinia!

      // set seed
      smilestore.local.seedID = 'seed_test'

      return RandomizeSubTimeline(timeline.seqtimeline[1].name, router)
    }

    // seed gets set in RandomizeSubTimeline, so this should just always return the same thing
    const shuffledRoutesArray = await Promise.all(Array(6).fill().map(doEverything))

    // all should be identical to first element
    expect(shuffledRoutesArray[1]).toStrictEqual(shuffledRoutesArray[0])
    expect(shuffledRoutesArray[2]).toStrictEqual(shuffledRoutesArray[0])
    expect(shuffledRoutesArray[3]).toStrictEqual(shuffledRoutesArray[0])
    expect(shuffledRoutesArray[4]).toStrictEqual(shuffledRoutesArray[0])
    expect(shuffledRoutesArray[5]).toStrictEqual(shuffledRoutesArray[0])
  })

  it('should set meta prev and next after re-ordering by conditions', async () => {
    const MockComponent = { template: '<div>Mock Component</div>' }

    const timeline = new Timeline()
    const subtimeline = new RandomSubTimeline()
    timeline.pushSeqView({
      path: '/',
      name: 'first',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid2',
      name: 'mid2',
      component: MockComponent,
    })
    timeline.pushRandomizedTimeline({
      name: subtimeline,
      meta: { label: 'orderCond', orders: { cond1: ['mid1', 'mid2'], cond2: ['mid2', 'mid1'] } },
    })

    timeline.pushSeqView({
      path: '/last',
      name: 'last',
      component: MockComponent,
    })

    timeline.build()
    const { routes } = timeline

    const wrapper = setupapp(routes)
    await router.isReady()

    const smilestore = useSmileStore() // uses the testing pinia!
    smilestore.data.conditions.orderCond = 'cond1'

    const shuffledRoutes = RandomizeSubTimeline(timeline.seqtimeline[1].name, router)

    // find each route in router by name
    const newRoutes = router.getRoutes()
    const firstRoute = newRoutes.find((route) => route.name === 'first')
    const mid1Route = newRoutes.find((route) => route.name === 'mid1')
    const mid2Route = newRoutes.find((route) => route.name === 'mid2')
    const lastRoute = newRoutes.find((route) => route.name === 'last')

    expect(firstRoute.meta.next).toBe('mid1')
    expect(mid1Route.meta.next).toBe('mid2')
    expect(mid2Route.meta.next).toBe('last')
    expect(lastRoute.meta.next).toBe(null)

    expect(firstRoute.meta.prev).toBe(null)
    expect(mid1Route.meta.prev).toBe('first')
    expect(mid2Route.meta.prev).toBe('mid1')
    expect(lastRoute.meta.prev).toBe('mid2')
  })

  it('should set meta prev and next after re-ordering by random shuffle', async () => {
    const MockComponent = { template: '<div>Mock Component</div>' }

    const timeline = new Timeline()
    const subtimeline = new RandomSubTimeline()
    timeline.pushSeqView({
      path: '/',
      name: 'first',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    subtimeline.registerView({
      path: '/mid2',
      name: 'mid2',
      component: MockComponent,
    })
    timeline.pushRandomizedTimeline({
      name: subtimeline,
    })

    timeline.pushSeqView({
      path: '/last',
      name: 'last',
      component: MockComponent,
    })

    timeline.build()
    const { routes } = timeline

    const wrapper = setupapp(routes)
    await router.isReady()

    const shuffledRoutes = RandomizeSubTimeline(timeline.seqtimeline[1].name, router)

    // find each route in router by name
    const newRoutes = router.getRoutes()
    const firstRoute = newRoutes.find((route) => route.name === 'first')
    const mid1Route = newRoutes.find((route) => route.name === 'mid1')
    const mid2Route = newRoutes.find((route) => route.name === 'mid2')
    const lastRoute = newRoutes.find((route) => route.name === 'last')

    expect(['mid1', 'mid2']).toContain(firstRoute.meta.next)
    expect(['mid2', 'last']).toContain(mid1Route.meta.next)
    expect(['mid1', 'last']).toContain(mid2Route.meta.next)
    expect(lastRoute.meta.next).toBe(null)

    expect(firstRoute.meta.prev).toBe(null)
    expect(['first', 'mid2']).toContain(mid1Route.meta.prev)
    expect(['first', 'mid1']).toContain(mid2Route.meta.prev)
    expect(['mid1', 'mid2']).toContain(lastRoute.meta.prev)
  })
})
