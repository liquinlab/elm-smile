/* eslint-disable no-undef */
//import axios from 'axios'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHashHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import useAPI from '@/core/composables/useAPI'
import Timeline from '@/core/timeline'

vi.mock('axios', () => ({
  get: vi.fn(() => Promise.resolve({ data: '127.0.0.1' })),
}))

describe('Timeline tests', () => {
  let router
  let pinia
  let api
  const MockComponent = { template: '<div>Mock Component</div>' }

  beforeEach(() => {
    // Create a router instance
    router = createRouter({
      history: createWebHashHistory(),
      routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
    })

    // Create a test component that uses the API
    const TestComponent = defineComponent({
      setup() {
        api = useAPI()
        // Mock the required API properties
        api.config = {
          mode: 'production', // or 'development' or 'presentation' based on your needs
        }
        api.log = {
          debug: vi.fn(),
          error: vi.fn(),
          warn: vi.fn(),
          log: vi.fn(),
        }
        api.store = {
          getRandomizedRouteByName: vi.fn(),
          setRandomizedRoute: vi.fn(),
          registerStepper: vi.fn(),
          config: { mode: 'production' },
          local: {},
        }
        return { api }
      },
      template: '<div>Test Component</div>',
    })

    // Create pinia instance and set it as active
    pinia = createTestingPinia({ stubActions: true })
    setActivePinia(pinia)

    // Mount the test component with router
    mount(TestComponent, {
      global: {
        plugins: [[router], [pinia]],
      },
    })
  })

  // Helper function to add required welcome route
  const addWelcomeRoute = (timeline) => {
    timeline.pushSeqView({
      path: '/welcome',
      name: 'welcome_anonymous',
      component: MockComponent,
    })
  }

  it('should be able to create a timeline', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.build()
    expect(timeline).toBeDefined()
  })

  it('should be able to add a route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route',
      name: 'test_route',
      component: MockComponent,
    })

    timeline.build()
    expect(timeline.routes.length).toBe(3) // welcome + test route
  })

  it('should throw error on duplicate path', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route',
      name: 'test_route1',
      component: MockComponent,
    })

    expect(() => {
      timeline.pushSeqView({
        path: '/test-route',
        name: 'test_route2',
        component: MockComponent,
      })
    }).toThrow('DuplicatePathError:/test-route')
  })

  it('should throw error on duplicate name', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
    })

    expect(() => {
      timeline.pushSeqView({
        path: '/test-route2',
        name: 'test_route',
        component: MockComponent,
      })
    }).toThrow('DuplicateNameError:test_route')
  })

  it('should add a sequential route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)

    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
    })
    expect(timeline.routes.length).toBe(3)
    expect(timeline.seqtimeline.length).toBe(2)
  })

  it('should add a nonsequential route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.registerView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
    })
    expect(timeline.routes.length).toBe(3)
    expect(timeline.seqtimeline.length).toBe(1)

    // non sequential routes should be null
    expect(timeline.routes[1].meta.prev).toBe(undefined) // should be null
    expect(timeline.routes[1].meta.next).toBe(undefined) // should be null
  })

  it('should leave next and prev undefined but meta defined if a sequential route', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route',
      component: MockComponent,
      // meta: { prev: 'prev', next: 'next' },
    })
    expect(timeline.routes[1].meta).toBeDefined()
    expect(timeline.routes[1].meta.next).toBe(undefined)
    expect(timeline.routes[1].meta.prev).toBe(undefined)
  })

  it('should leave next or prev undefined if meta is configured for the other', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/test-route1',
      name: 'test_route1',
      component: MockComponent,
      meta: { next: 'next' },
    })
    expect(timeline.routes[2].meta).toBeDefined()
    expect(timeline.routes[2].meta.next).toBe('next')
    expect(timeline.routes[2].meta.prev).toBe(undefined)

    const timeline2 = new Timeline(api)
    addWelcomeRoute(timeline2)
    timeline2.pushSeqView({
      path: '/test-route2',
      name: 'test_route2',
      component: MockComponent,
      meta: { prev: 'prev' },
    })
    expect(timeline2.routes[2].meta.next).toBe(undefined)
    expect(timeline2.routes[2].meta.prev).toBe('prev')

    const timeline3 = new Timeline(api)
    addWelcomeRoute(timeline3)
    timeline3.pushSeqView({
      path: '/test-route3',
      name: 'test_route3',
      component: MockComponent,
    })
    expect(timeline3.routes[2].meta.next).toBe(undefined)
    expect(timeline3.routes[2].meta.prev).toBe(undefined)
  })

  it('should raise an error if a nonsequential route has prev/next defined', () => {
    const timeline = new Timeline(api)

    const errorTrigger = () => {
      timeline.registerView({
        path: '/',
        name: 'index',
        component: MockComponent,
        meta: { prev: 'prev', next: 'next' }, // this should raise an error because nonsequential route
      })
    }
    expect(errorTrigger).toThrowError()
  })

  it('should add a nonsequential and sequential route', () => {
    const timeline = new Timeline(api)
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponent,
    })
    timeline.registerView({
      path: '/two',
      name: 'two',
      component: MockComponent,
    })
    expect(timeline.routes.length).toBe(2 + 1)
    expect(timeline.seqtimeline.length).toBe(1)
  })

  it('should not allow the same sequential route to be registered twice', () => {
    const timeline = new Timeline(api)
    timeline.pushSeqView({
      path: '/thanks',
      name: 'thank',
      component: MockComponent,
    })

    const errorTrigger = () => {
      timeline.pushSeqView({
        path: '/thanks',
        name: 'thanks',
        component: MockComponent,
      })
    }
    expect(errorTrigger).toThrowError()
    expect(timeline.routes.length).toBe(2)
    expect(timeline.seqtimeline.length).toBe(1) // only first one should work
  })

  it('should not allow the same non-sequential route to be registered twice', () => {
    const timeline = new Timeline(api)
    timeline.registerView({
      path: '/thanks',
      name: 'thank',
      component: MockComponent,
    })
    const errorTrigger = () => {
      timeline.registerView({
        path: '/thanks',
        name: 'thanks',
        component: MockComponent,
      })
    }
    expect(errorTrigger).toThrowError()
    expect(timeline.routes.length).toBe(2)
    expect(timeline.seqtimeline.length).toBe(0)
  })

  it('should not allow the same route to be registered twice', () => {
    const timeline = new Timeline(api)
    timeline.pushSeqView({
      path: '/thanks',
      name: 'thank',
      component: MockComponent,
    })
    const errorTrigger = () => {
      timeline.registerView({
        path: '/thanks',
        name: 'thanks',
        component: MockComponent,
      })
    }
    expect(errorTrigger).toThrowError()
    expect(timeline.routes.length).toBe(2)
    expect(timeline.seqtimeline.length).toBe(1) // only first one should work
  })

  it('cannot add a timeline to a timeline', () => {
    const timeline = new Timeline(api)
    const timeline2 = new Timeline(api)
    timeline.pushSeqView({
      path: '/first',
      name: 'first',
      component: MockComponent,
    })
    timeline2.registerView({
      path: '/mid1',
      name: 'mid1',
      component: MockComponent,
    })
    const errorTrigger = () => {
      timeline.pushRandomizedTimeline({
        name: timeline2,
      })
    }
    expect(errorTrigger).toThrowError()
  })

  it('build method should correctly configure a doubly linked list', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/two',
      name: 'two',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponent,
    })
    timeline.build()

    expect(timeline.seqtimeline[0].meta.next).toBe('one')
    expect(timeline.seqtimeline[1].meta.next).toBe('two')
    expect(timeline.seqtimeline[2].meta.next).toBe('three')
    expect(timeline.seqtimeline[3].meta.next).toBe('four')
    expect(timeline.seqtimeline[4].meta.next).toBe(null)

    expect(timeline.seqtimeline[0].meta.prev).toBe(null)
    expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous')
    expect(timeline.seqtimeline[2].meta.prev).toBe('one')
    expect(timeline.seqtimeline[3].meta.prev).toBe('two')
    expect(timeline.seqtimeline[4].meta.prev).toBe('three')
  })

  it('build method should handle single item timeline correctly', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.build()

    expect(timeline.seqtimeline[0].meta.next).toBe(null)
    expect(timeline.seqtimeline[0].meta.prev).toBe(null)
  })

  it('build method should configure a loop', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/two',
      name: 'two',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponent,
      meta: { next: 'one' },
    })
    timeline.build()

    expect(timeline.seqtimeline[0].meta.next).toBe('one')
    expect(timeline.seqtimeline[1].meta.next).toBe('two')
    expect(timeline.seqtimeline[2].meta.next).toBe('three')
    expect(timeline.seqtimeline[3].meta.next).toBe('four')
    expect(timeline.seqtimeline[4].meta.next).toBe('one')

    expect(timeline.seqtimeline[0].meta.prev).toBe(null)
    expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous')
    expect(timeline.seqtimeline[2].meta.prev).toBe('one')
    expect(timeline.seqtimeline[3].meta.prev).toBe('two')
    expect(timeline.seqtimeline[4].meta.prev).toBe('three')
  })

  it('build method should allow complex routes, disconnect sequences', () => {
    const timeline = new Timeline(api)
    addWelcomeRoute(timeline)
    timeline.pushSeqView({
      path: '/one-a',
      name: 'one',
      component: MockComponent,
      meta: { next: 'two' },
    })
    timeline.pushSeqView({
      path: '/one-b',
      name: 'one-b',
      component: MockComponent,
      meta: { next: 'two' },
    })
    // both flow into node two
    timeline.registerView({
      // this has not implicit successor
      path: '/two',
      name: 'two',
      component: MockComponent,
    }) // leaving this node has to happen with logic inside the component

    // let hand branch
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponent,
      meta: { next: 'one' },
    })
    timeline.registerView({
      // this has no implicit successor
      path: '/five',
      name: 'five',
      component: MockComponent,
    })

    // right hand branch
    timeline.pushSeqView({
      path: '/six',
      name: 'six',
      component: MockComponent,
    })
    timeline.pushSeqView({
      path: '/seven',
      name: 'seven',
      component: MockComponent,
    })
    timeline.registerView({
      // this has no implicit successor
      path: '/eight',
      name: 'eight',
      component: MockComponent,
    })

    timeline.build()

    // Check the sequence starting from welcome
    expect(timeline.seqtimeline[0].meta.next).toBe('one') // welcome -> one
    expect(timeline.seqtimeline[1].meta.next).toBe('two') // one -> two
    expect(timeline.seqtimeline[2].meta.next).toBe('two') // one-b -> two
    expect(timeline.seqtimeline[3].meta.next).toBe('four') // three -> four
    expect(timeline.seqtimeline[4].meta.next).toBe('one') // four -> one (loop)

    expect(timeline.seqtimeline[0].meta.prev).toBe(null) // welcome has no prev
    expect(timeline.seqtimeline[1].meta.prev).toBe('welcome_anonymous') // one prev is welcome
    expect(timeline.seqtimeline[2].meta.prev).toBe('one') // one-b prev is welcome
    expect(timeline.seqtimeline[3].meta.prev).toBe('one-b') // three prev is two
    expect(timeline.seqtimeline[4].meta.prev).toBe('three') // four prev is three
  })
  /*
  it('should compute the progress correctly', () => {
    const MockComponentOne = { template: '<div>Mock Component One</div>' }
    const MockComponentTwo = { template: '<div>Mock Component Two</div>' }
    const MockComponentThree = { template: '<div>Mock Component Three</div>' }
    const MockComponentFour = { template: '<div>Mock Component Four</div>' }

    const timeline = new Timeline()
    timeline.pushSeqView({
      path: '/one',
      name: 'one',
      component: MockComponentOne,
    })
    timeline.pushSeqView({
      path: '/two',
      name: 'two',
      component: MockComponentTwo,
    })
    timeline.pushSeqView({
      path: '/three',
      name: 'three',
      component: MockComponentThree,
    })
    timeline.buildProgress()
    expect(timeline.seqtimeline[0].meta.progress).toBe((100 * 0) / (3 - 1)) // zero progress
    expect(timeline.seqtimeline[1].meta.progress).toBe((100 * 1) / (3 - 1)) // remaining is split
    expect(timeline.seqtimeline[2].meta.progress).toBe((100 * 2) / (3 - 1))

    timeline.pushSeqView({
      path: '/four',
      name: 'four',
      component: MockComponentFour,
    })

    timeline.buildProgress() // rebuild timeline
    expect(timeline.seqtimeline[0].meta.progress).toBe((100 * 0) / (4 - 1)) // zero progress
    expect(timeline.seqtimeline[1].meta.progress).toBe((100 * 1) / (4 - 1)) // remaining is split
    expect(timeline.seqtimeline[2].meta.progress).toBe((100 * 2) / (4 - 1))
    expect(timeline.seqtimeline[3].meta.progress).toBe((100 * 3) / (4 - 1))
  })
  */
})
