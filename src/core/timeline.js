import _ from 'lodash'
import * as dagre from '@dagrejs/dagre'
import useSmileStore from '@/core/stores/smiledata'
const smilestore = useSmileStore()
import useLog from '@/core/stores/log'
const log = useLog()
import RandomSubTimeline from '@/core/subtimeline'

class Timeline {
  constructor() {
    this.routes = [] // the actual routes given to VueRouter
    this.seqtimeline = [] // copies of routes that are sequential
    this.type = 'timeline'
    this.g = null
    this.g_nonseq = null
    this._IS_ROOT_NODE = '_IS_ROOT_NODE'
  }

  pushToRoutes(route) {
    // check that an existing route doesn't exist with same
    // path and/or name
    for (let i = 0; i < this.routes.length; i += 1) {
      if (this.routes[i].path === route.path) {
        log.error(`Registering two routes to router with same path.  DuplicatePathError:${route.path}`)
        throw new Error(`DuplicatePathError:${route.path}`)
      }
      if (this.routes[i].name === route.name) {
        log.error(`Registering two routes to router =with same name.  DuplicatePathError:${route.name}`)
        throw new Error(`DuplicateNameError:${route.name}`)
      }
    }
    this.routes.push(route)
  }

  pushToTimeline(route) {
    // check that an existing route doesn't exist with same
    // path and/or name
    for (let i = 0; i < this.seqtimeline.length; i += 1) {
      if (this.seqtimeline[i].name === route.name) {
        log.error(`Registering two routes to timeline with same name.  DuplicatePathError:${route.name}`)
        throw new Error(`DuplicateNameError${route.name}`)
      }
      // only check for duplicate paths if the route name is not an object (subtimeline)
      if (typeof route.name !== 'object') {
        if (this.seqtimeline[i].path === route.path) {
          log.error(`Registering two routes to timeline with same path.  DuplicatePathError:${route.path}`)
          throw new Error(`DuplicatePathError${route.path}`)
        }
      }
    }
    this.seqtimeline.push(route)
  }

  pushRootSeqRoute(routeConfig) {
    // we should be able to infer this the problem is the current route
    // is unknown
    const newroute = _.cloneDeep(routeConfig)
    newroute.meta.prev = undefined
    newroute.meta.root = true
    newroute.meta.type = this.pushSeqRoute(newroute)
  }

  pushSeqRoute(routeConfig) {
    const newroute = _.cloneDeep(routeConfig)
    if (!newroute.meta) {
      newroute.meta = { next: undefined, prev: undefined } // need to configure it
    } else {
      if (!newroute.meta.next) {
        // need to configure next
        newroute.meta.next = undefined
      }

      if (!newroute.meta.prev) {
        // need to configure prev
        newroute.meta.prev = undefined
      }
    }
    newroute.meta.type = 'route'
    newroute.meta.sequential = true

    try {
      this.pushToRoutes(newroute)
    } catch (err) {
      log.error('Smile FATAL ERROR: ', err)
      throw err
    }

    try {
      this.pushToTimeline(newroute) // by reference so should update together
    } catch (err) {
      log.error('Smile FATAL ERROR: ', err)
      throw err
    }
  }

  pushRoute(routeConfig) {
    const newroute = _.cloneDeep(routeConfig)
    // should NOT allow meta next/prev to exist
    if (!newroute.meta) {
      newroute.meta = { prev: null, next: null, type: 'route' }
    } else if (newroute.meta.prev || newroute.meta.next) {
      throw new Error(`NonSequentialRouteError: Can't have meta.next or meta.prev defined for non-sequential route`)
    }
    newroute.meta.sequential = false
    try {
      this.pushToRoutes(newroute)
    } catch (err) {
      console.error('Smile FATAL ERROR: ', err)
      throw err
    }
  }

  pushRandomizedTimeline(timeline) {
    if (timeline.name.type !== 'randomized_sub_timeline') {
      throw new Error('Can only push randomized timelines to timelines')
    }
    const newtimeline = _.cloneDeep(timeline)

    // need to configure next and prev
    if (!newtimeline.meta) {
      newtimeline.meta = { next: undefined, prev: undefined, type: 'timeline' }
    } else {
      newtimeline.meta.next = undefined
      newtimeline.meta.prev = undefined
      newtimeline.meta.type = 'timeline'
    }

    // get all the routes inside the timeline and add them to routes
    newtimeline.name.routes.forEach((route) => {
      try {
        this.pushToRoutes(route)
      } catch (err) {
        log.error('Smile FATAL ERROR: ', err)
        throw err
      }
    })

    // add the timeline object itself to the timeline
    this.pushToTimeline(newtimeline)
  }

  build() {
    this.buildGraph()
    this.registerCounters()
    if (smilestore.config.mode === 'development') {
      this.buildDAG()
    }
    // this.buildProgress()
  }

  registerCounters() {
    // for each route, register a counter based on the name
    for (let i = 0; i < this.routes.length; i += 1) {
      smilestore.registerPageTracker(this.routes[i].name)
    }
  }

  buildDAG() {
    log.log('building DAG')
    this.g = new dagre.graphlib.Graph().setGraph({ nodesep: 80, ranksep: 40 }).setDefaultEdgeLabel(function () {
      return {}
    }) // Default to assigning a new object as a label for each new edge.
    this.g_nonseq = new dagre.graphlib.Graph().setGraph({ nodesep: 80, ranksep: 40 }).setDefaultEdgeLabel(function () {
      return {}
    }) // Default to assigning a new object as a label for each new edge.

    for (let i = 0; i < this.routes.length; i += 1) {
      if (this.routes[i].meta.sequential == false) {
        if (this.routes[i].component) {
          this.g_nonseq.setNode(this.routes[i].name, {
            name: this.routes[i].name,
            label: this.routes[i].component.__name + '.vue',
            class: 'node',
            shape: 'circle',
          })
        }
      }
    }
    /*  add a non sequential route
      this.g_nonseq.setNode('recruit', { name: 'recruit', label: 'RecruitmentChooser.vue', class: 'node', shape: 'circle' })
      */
    for (let i = 0; i < this.seqtimeline.length; i += 1) {
      if (this.seqtimeline[i].meta.type === 'timeline') {
        // don't know whast to do about the subtimeline things
      } else {
        this.g.setNode(this.seqtimeline[i].name, {
          name: this.seqtimeline[i].name,
          label: this.seqtimeline[i].component.__name + '.vue',
          class: 'node',
          shape: 'circle',
        })
        if (!(this.seqtimeline[i].meta.next instanceof RandomSubTimeline) && this.seqtimeline[i].meta.next !== null) {
          this.g.setEdge(this.seqtimeline[i].name, this.seqtimeline[i].meta.next)
        }
      }
    }
  }

  // buildGraph builds
  buildGraph() {
    log.debug('building DAG for timeline')
    // keep track of which objects in sequential timeline are themselves timelines
    const timelineIndices = []

    for (let i = 0; i < this.seqtimeline.length; i += 1) {
      if (this.seqtimeline[i].meta.next === undefined) {
        // pass
        if (i === 0) {
          this.seqtimeline[i].meta.next = this.seqtimeline[i + 1].name
        } else if (i === this.seqtimeline.length - 1) {
          this.seqtimeline[i].meta.next = null
        } else {
          this.seqtimeline[i].meta.next = this.seqtimeline[i + 1].name
        }
      }
      if (!this.seqtimeline[i].meta.root && this.seqtimeline[i].meta.prev === undefined) {
        // pass
        if (i === 0) {
          this.seqtimeline[i].meta.prev = null
        } else if (i === this.seqtimeline.length - 1) {
          this.seqtimeline[i].meta.prev = this.seqtimeline[i - 1].name
        } else {
          this.seqtimeline[i].meta.prev = this.seqtimeline[i - 1].name
        }
      } else {
        this.seqtimeline[i].meta.prev = null
      }

      if (this.seqtimeline[i].meta.type === 'timeline') {
        timelineIndices.push(i)
      }
    }

    // propogate various meta fields to the routes within the timeline
    // this is relevant for next, previous, label, and orders -- we need that meta info at the route level
    timelineIndices.forEach((index) => {
      this.seqtimeline[index].name.routes.forEach((route, i) => {
        this.seqtimeline[index].name.routes[i].meta = {
          ...this.seqtimeline[index].name.routes[i].meta,
          ...this.seqtimeline[index].meta,
        }
      })
    })
  }

  // this won't work with new system
  // buildProgress assigns progrees meeter values to each route
  // buildProgress() {
  //   const seqTimelineLength = this.seqtimeline.length
  //   for (let i = 0; i < seqTimelineLength; i++) {
  //     this.seqtimeline[i].meta.routeIdx = i
  //     this.seqtimeline[i].meta.progress = (100 * i) / (seqTimelineLength - 1)
  //   }
  // }
}

export default Timeline
