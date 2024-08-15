import _ from 'lodash'
import useSmileStore from '@/core/stores/smilestore'
import * as random from '@/core/randomization'
import seedrandom from 'seedrandom'
import { v4 as uuidv4 } from 'uuid'

class RandomSubTimeline {
  constructor() {
    this.routes = [] // the actual routes given to VueRouter
    this.type = 'randomized_sub_timeline'
  }

  pushToRoutes(route) {
    // check that an existing route doesn't exist with same
    // path and/or name
    for (let i = 0; i < this.routes.length; i += 1) {
      if (this.routes[i].path === route.path) {
        throw new Error(`DuplicatePathError:${route.path}`)
      }
      if (this.routes[i].name === route.name) {
        throw new Error(`DuplicateNameError:${route.name}`)
      }
    }
    this.routes.push(route)
  }

  pushView(routeConfig) {
    const newroute = _.cloneDeep(routeConfig)
    // should NOT allow meta next/prev to exist
    if (!newroute.meta) {
      newroute.meta = { prev: undefined, next: undefined }
    } else if (newroute.meta.prev || newroute.meta.next) {
      throw new Error(`SubRouteError: Can't have meta.next or meta.prev defined for randomized subroute`)
    }
    newroute.meta.subroute = true
    try {
      this.pushToRoutes(newroute)
    } catch (err) {
      console.error('Smile FATAL ERROR: ', err)
      throw err
    }
  }
}

export function RandomizeSubTimeline(subTimeline, router) {
  const smilestore = useSmileStore()

  // get route before and route after from subTimeline.routes[0].meta.next and prev
  const routeBefore = router.getRoutes().find((route) => route.name === subTimeline.routes[0].meta.prev)
  const routeAfter = router.getRoutes().find((route) => route.name === subTimeline.routes[0].meta.next)

  // set seed for randomization
  if (smilestore.local.seedActive) {
    const seedID = smilestore.getSeedID
    // randomize seed with the name of the previous route
    const seed = `${seedID}-${routeBefore.name}-subtimeline`
    seedrandom(seed, { global: true })
  } else {
    // if inactive, generate a random string then re-seed
    const newseed = uuidv4()
    seedrandom(newseed, { global: true })
  }

  let orderedRoutes = []

  // if orders are set, then we want to use the conditions from the data to set the order as specified
  const metaInfo = subTimeline.routes[0].meta
  if (metaInfo.orders && metaInfo.label) {
    console.log('setting random route order based on condition and prespecified orders')

    // get condition from data, and then select route order specified for that condition
    const cond = smilestore.getConditionByName(metaInfo.label)

    if (!cond) {
      throw new Error(`ConditionError: Condition label ${metaInfo.label} not found in data`)
    } else {
      const routeOrder = metaInfo.orders[cond]
      // put subTimeline.routes in the order specified by routeOrder
      orderedRoutes = routeOrder.map((order) => subTimeline.routes.find((r) => r.name === order))
    }
  } else {
    console.log('setting random route order based on random seed')
    // if not, then we want to randomize the order: shuffle the routes in subTimeline
    orderedRoutes = random.shuffle(subTimeline.routes)
  }

  // for each route, set the meta.next and meta.prev to be the proper route.
  // By default, both routes already have meta.next as the next route (after the randomized subtimeline), so this can be kept for the last route
  // By default, both routes already have meta.prev as the previous route (before the randomized subtimeline), so this can be kept for the first route
  orderedRoutes.forEach((orderRoute, index) => {
    if (index !== 0) {
      orderedRoutes[index].meta.prev = orderedRoutes[index - 1].name
    }
    if (index !== orderedRoutes.length - 1) {
      orderedRoutes[index].meta.next = orderedRoutes[index + 1].name
    }
  })

  // for the route before, change meta.next to be the first route in the randomized subtimeline
  routeBefore.meta.next = orderedRoutes[0].name
  // for the route after, change meta.prev to be the last route in the randomized subtimeline
  routeAfter.meta.prev = orderedRoutes[orderedRoutes.length - 1].name

  // return the next route
  return orderedRoutes
}

export default RandomSubTimeline
