import _ from 'lodash'
import * as dagre from '@dagrejs/dagre'
import RecruitmentChooser from '@/dev/developer_mode/RecruitmentChooserView.vue'
import PresentationMode from '@/dev/presentation_mode/PresentationModeView.vue'

class Timeline {
  constructor(api) {
    this.api = api
    this.routes = [] // the actual routes given to VueRouter
    this.seqtimeline = [] // copies of routes that are sequential
    this.registered = {}
    this.type = 'timeline'
    this.g = null
    this.has_welcome_anonymous = false
    this.g_nonseq = null
    this._IS_ROOT_NODE = '_IS_ROOT_NODE'
    // add the recruitment chooser if in development mode
    if (api.config.mode === 'development') {
      this.registerView({
        path: '/',
        name: 'recruit',
        component: RecruitmentChooser,
        meta: { allowAlways: true, requiresConsent: false },
      })
    } else if (api.config.mode === 'presentation') {
      this.registerView({
        path: '/',
        name: 'presentation_home',
        component: PresentationMode,
        meta: { allowAlways: true, requiresConsent: false },
      })
    } else {
      // auto refer to the anonymous welcome page
      this.registerView({
        path: '/',
        name: 'landing',
        redirect: {
          name: 'welcome_anonymous',
        },
        meta: { allowAlways: true, requiresConsent: false },
      })
    }
  }

  cloneRouteAndFillDefaults(route) {
    const newroute = _.cloneDeep(route)

    if (newroute.path == null) {
      const nameAsPath = `/${encodeURIComponent(newroute.name.toLowerCase().replace(/\s/g, '_'))}`
      this.api.log.debug(`Assigning path by name for route ${newroute.name}: ${nameAsPath}`)
      newroute.path = nameAsPath
    }

    return newroute
  }

  pushToRoutes(route) {
    for (let i = 0; i < this.routes.length; i += 1) {
      if (this.routes[i].path === route.path) {
        this.api.log.error(`Registering two routes to router with same path.  DuplicatePathError:${route.path}`)
        throw new Error(`DuplicatePathError:${route.path}`)
      }
      if (this.routes[i].name === route.name) {
        this.api.log.error(`Registering two routes to router with same name.  DuplicatePathError:${route.name}`)
        throw new Error(`DuplicateNameError:${route.name}`)
      }
    }
    this.routes.push(route)
  }

  pushToTimeline(route) {
    for (let i = 0; i < this.seqtimeline.length; i += 1) {
      if (this.seqtimeline[i].name === route.name) {
        this.api.log.error(`Registering two routes to timeline with same name.  DuplicatePathError:${route.name}`)
        throw new Error(`DuplicateNameError${route.name}`)
      }
      if (this.seqtimeline[i].path === route.path) {
        this.api.log.error(`Registering two routes to timeline with same path.  DuplicatePathError:${route.path}`)
        throw new Error(`DuplicatePathError${route.path}`)
      }
    }
    this.seqtimeline.push(route)
  }

  pushSeqView(routeConfig) {
    const newroute = this.cloneRouteAndFillDefaults(routeConfig)
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
    newroute.meta.level = 0

    if (newroute.meta.requiresConsent == undefined) {
      newroute.meta.requiresConsent = true // default to require consent
    }

    if (newroute.meta.requiresDone == undefined) {
      newroute.meta.requiresDone = false // default to not require done
    }

    if (newroute.meta.requiresWithdraw == undefined) {
      newroute.meta.requiresWithdraw = false // default to not require done
    }

    try {
      this.pushToRoutes(newroute)
    } catch (err) {
      this.api.log.error('Smile FATAL ERROR: ', err)
      throw err
    }

    try {
      this.pushToTimeline(newroute) // by reference so should update together
    } catch (err) {
      this.api.log.error('Smile FATAL ERROR: ', err)
      throw err
    }

    if (newroute.name === 'welcome_anonymous') {
      this.has_welcome_anonymous = true
    }
  }

  registerView(routeConfig) {
    const newroute = this.cloneRouteAndFillDefaults(routeConfig)
    // should NOT allow meta next/prev to exist
    if (!newroute.meta) {
      newroute.meta = { prev: null, next: null, type: 'route' }
    } else if (newroute.meta.prev || newroute.meta.next) {
      throw new Error(`NonSequentialRouteError: Can't have meta.next or meta.prev defined for non-sequential route`)
    }
    newroute.meta.sequential = false
    newroute.meta.level = 0

    if (newroute.meta.requiresConsent == undefined) {
      newroute.meta.requiresConsent = true // default to require consent
    }

    if (newroute.meta.requiresDone == undefined) {
      newroute.meta.requiresDone = false // default to not require done
    }

    if (newroute.meta.requiresWithdraw == undefined) {
      newroute.meta.requiresWithdraw = false // default to not require done
    }

    try {
      this.pushToRoutes(newroute)
    } catch (err) {
      this.api.log.error('Smile FATAL ERROR: ', err)
      throw err
    }

    if (newroute.name === 'welcome_anonymous') {
      this.has_welcome_anonymous = true
    }
  }

  pushRandomizedNode(routeConfig, push = true) {
    const newroute = this.cloneRouteAndFillDefaults(routeConfig)

    if (!push) {
      if (this.registered[newroute.name]) {
        this.api.log.debug(`Randomized node ${newroute.name} already registered`)
        return
      } else {
        this.registered[newroute.name] = []
      }
    }

    // get options
    const options = newroute.options

    // get weights
    let weights = undefined
    if (newroute.weights) {
      weights = newroute.weights

      // check that options and weights are the same length
      if (options.length !== weights.length) {
        this.api.log.error('Length of options and weights do not match for randomized node')
        throw new Error('OptionsWeightsLengthMismatchError')
      }
    }

    // Use this.api.store instead of smilestore
    let randomOption = this.api.store.getRandomizedRouteByName(newroute.name)
    if (randomOption != null) {
      this.api.log.debug(`Randomized node ${newroute.name} already assigned option ${randomOption}`)
    } else {
      randomOption = this.api.sampleWithReplacement(options, 1, weights)[0]
      this.api.log.debug(`Randomized node ${newroute.name} selected option ${randomOption}`)
      this.api.store.setRandomizedRoute(newroute.name, randomOption)
    }

    // now, pull entries from routes that match random Option names (for each random option)
    this._handleRandomizedOption(newroute, randomOption, push)
  }

  _handleRandomizedOption(newroute, randomOption, push) {
    for (let i = 0; i < randomOption.length; i += 1) {
      const option = randomOption[i]
      const route = this.routes.find((r) => r.name === option)
      if (!route) {
        if (option in this.registered) {
          // if the route(s) are in the registered list, pull it from there
          const registeredRoutes = this.registered[option]
          delete this.registered[option]
          if (registeredRoutes) {
            // TODO: Do we actually need to do this?
            registeredRoutes.forEach((r) => {
              // TODO: should we also set something about the parent? meta-parent?
              r.meta.level += 1
            })

            if (push) {
              registeredRoutes.forEach((r) => {
                this.pushToTimeline(r)
              })
            } else {
              this.registered[newroute.name].push(...registeredRoutes)
            }
          }
          continue
        } else {
          this.api.log.error(
            `Randomized node option ${option} not found in routes. You must add randomized route options to the timeline using registerView() before adding a randomized node`
          )
          throw new Error('RandomizedNodeOptionNotFoundError')
        }
      }

      route.meta = { next: undefined, prev: undefined } // need to configure next/prev for sequential routes
      route.meta.sequential = true
      route.meta.level = 1
      route.meta.parentRandomizer = newroute.name

      if (push) {
        // add the route to the sequential timeline
        this.pushToTimeline(route)
      } else {
        // add the route to the registered list to be consumed later
        this.registered[newroute.name].push(route)
      }
    }
  }

  registerRandomizedNode(routeConfig) {
    this.pushRandomizedNode(routeConfig, false)
  }

  pushConditionalNode(routeConfig, push = true) {
    // newroute should have name and a condition name (user specified, has to match something in data.conditions)
    const newroute = this.cloneRouteAndFillDefaults(routeConfig)

    // Check if already registered if not pushing
    if (!push) {
      if (this.registered[newroute.name]) {
        this.api.log.debug(`Randomized node ${newroute.name} already registered`)
        return
      } else {
        this.registered[newroute.name] = []
      }
    }

    // get condition name—anything that's not name
    const conditionname = Object.keys(newroute).filter((key) => key !== 'name')
    if (conditionname.length > 1) {
      this.api.log.error('Can only branch routes based on one condition at a time')
      throw new Error('TooManyConditionNamesError')
    }
    const name = conditionname[0]
    let assignedCondition = this.api.getConditionByName(name)
    if (!assignedCondition) {
      const possibleConditions = Object.keys(newroute[name])
      this.api.log.warn(
        `Condition ${name} not found in data.conditions -- assigning uniformly from keys of condition object: ${possibleConditions}`
      )

      assignedCondition = this.api.randomAssignCondition({
        conditionname: possibleConditions,
      })
    }

    // based on assigned condition, get the correct set of routes

    const randomOption = newroute[name][assignedCondition]

    this._handleRandomizedOption(newroute, randomOption, push)
  }

  registerConditionalNode(routeConfig) {
    this.pushConditionalNode(routeConfig, false)
  }

  build() {
    if (!this.has_welcome_anonymous) {
      this.api.log.error('No welcome_anonymous route defined in src/user/design.js  This is required.')
      throw new Error('NoWelcomeAnonymousRouteError')
    }

    this.buildGraph()
    this.registerCounters()
    if (this.api.store.config.mode === 'development') {
      this.buildDAG()
    }
    // this.buildProgress()
    // save built timeline to local

    this.api.store.local.seqtimeline = this.seqtimeline
    this.api.store.local.routes = this.routes
  }

  registerCounters() {
    // for each route, register a counter based on the name
    for (let i = 0; i < this.routes.length; i += 1) {
      this.api.store.registerStepper(this.routes[i].name)
    }
  }

  buildDAG() {
    this.api.log.log('DEV MODE: building DAG')
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
      if (this.seqtimeline[i].meta.type === 'random_node') {
        // don't know whast to do about the random nodes
      } else {
        this.g.setNode(this.seqtimeline[i].name, {
          name: this.seqtimeline[i].name,
          label: this.seqtimeline[i].component.__name + '.vue',
          class: 'node',
          shape: 'circle',
        })
      }
    }
  }

  // buildGraph builds
  buildGraph() {
    this.api.log.debug('DEV MODE: building DAG for timeline')

    for (let i = 0; i < this.seqtimeline.length; i += 1) {
      if (this.seqtimeline[i].meta.next === undefined) {
        if (this.seqtimeline.length === 1) {
          this.seqtimeline[i].meta.next = null
        } else if (i === 0) {
          this.seqtimeline[i].meta.next = this.seqtimeline[i + 1].name
        } else if (i === this.seqtimeline.length - 1) {
          this.seqtimeline[i].meta.next = null
        } else {
          this.seqtimeline[i].meta.next = this.seqtimeline[i + 1].name
        }
      }
      if (!this.seqtimeline[i].meta.root && this.seqtimeline[i].meta.prev === undefined) {
        if (this.seqtimeline.length === 1) {
          this.seqtimeline[i].meta.prev = null
        } else if (i === 0) {
          this.seqtimeline[i].meta.prev = null
        } else if (i === this.seqtimeline.length - 1) {
          this.seqtimeline[i].meta.prev = this.seqtimeline[i - 1].name
        } else {
          this.seqtimeline[i].meta.prev = this.seqtimeline[i - 1].name
        }
      } else {
        this.seqtimeline[i].meta.prev = null
      }
    }
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
