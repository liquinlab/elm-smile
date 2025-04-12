/**
 * @module smilestore
 * @description Pinia store for managing global application state. Handles:
 * - User data and consent management
 * - Firebase database connections and operations
 * - Experiment condition randomization and routing
 * - Trial/step data recording and management
 * - Global UI state and dev tools
 * The store serves as the central state management system for the SMILE framework,
 * coordinating data flow between components, views, and external services.
 */
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import axios from 'axios'
import appconfig from '@/core/config'
import { v4 as uuidv4 } from 'uuid'
import seedrandom from 'seedrandom'
import useLog from '@/core/stores/log'
import {
  createDoc,
  createPrivateDoc,
  updateSubjectDataRecord,
  updatePrivateSubjectDataRecord,
  loadDoc,
  fsnow,
} from './firestore-db'
import sizeof from 'firestore-size'

////////////  SET THE SEED FOR RANDOMIZATION //////////

// note: we only need to run this on page load (not every time smilestore.js is imported in another file)
// it seems like it doesn't re-run when we move to a new component that imports smilestore,
// so it's doing what we want apparently

// get local storage
const existingLocalStorage = JSON.parse(localStorage.getItem(appconfig.localStorageKey))

let seed
// if there is no local storage, then definitely have to set seed
if (!existingLocalStorage) {
  seed = uuidv4()
} else {
  // if there is local storage, check if we have seed usage turned on
  if (existingLocalStorage.useSeed) {
    // does seed already exist?
    const seedSet = existingLocalStorage.seedSet
    if (seedSet) {
      // if seed already exists, get seedID
      seed = existingLocalStorage.seedID
    } else {
      // if seed is not set, generate a new seed
      seed = uuidv4()
    }
  } else {
    // if seed usage is turned off, don't set seed
    seed = null
  }
}

// if seed is not null
if (seed) {
  // set the seed
  seedrandom(seed, { global: true })
  //console.log('Set global seed to ' + seed)

  // save to local storage
  localStorage.setItem(
    appconfig.localStorageKey,
    JSON.stringify({ ...existingLocalStorage, seedID: seed, seedSet: true })
  )
}

/////// continue with setting up smilestore ///////
/**
 * Determines the initial route based on application mode
 * @param {string} mode - Application mode ('development', 'presentation', or other)
 * @returns {string} Initial route name to use
 * - 'recruit' for development mode
 * - 'presentation_home' for presentation mode
 * - 'landing' for all other modes
 */
function initLastRoute(mode) {
  if (mode === 'development') {
    return 'recruit'
  }
  if (mode === 'presentation') {
    return 'presentation_home'
  }
  return 'landing'
}

/**
 * Removes Firebase configuration from a config object
 * @param {Object} config - Configuration object that may contain Firebase config
 * @param {Object} [config.firebaseConfig] - Firebase configuration to remove
 * @returns {Object} Config object with Firebase configuration removed
 */
function removeFirestore(config) {
  const { firebaseConfig, ...rest } = config
  return rest
}

/**
 * Initial state values for different store sections
 * The following sections define initial values for:
 * - Dev settings (initDev): Development-related UI state and settings that sync with localStorage
 * - Local settings (initLocal): User-specific state that syncs with localStorage
 * - Global settings (initGlobal): Ephemeral state that resets on page refresh
 */

const initDev = {
  // syncs with local storage
  pageProvidesAutofill: null, // does current page offer autofil (transient)
  pageProvidesTrialStepper: false, // does current page provide a trial stepper (transient)
  showConsoleBar: false, // show/hide the data base bottom (transient)
  showSideBar: false,
  pinnedRoute: null,
  consoleBarHeight: 300, // height of the data bar (transient)
  consoleBarTab: 'browse', // which tab to show in the data bar (transient)
  searchParams: '', // search parameters (transient)
  logFilter: 'All', // what level of log messages to show (transient)
  notificationFilter: 'Errors only', // what level of notifications to show (transient)
  lastPageLimit: false, // limits logs to the last page (transient)
  dataPath: null, // path to the data (transient)
  configPath: null, // path to the config (transient)
  // panel locations (transient)
  configPanel: { type: 'local', visible: false, x: -280, y: 0 },
  randomizationPanel: { visible: false, x: -130, y: 0 },
  routePanel: { visible: false, x: -0, y: -3 },
}

const initLocal = {
  // syncs with local storage
  knownUser: false,
  lastRoute: initLastRoute(appconfig.mode),
  docRef: null,
  privateDocRef: null,
  completionCode: null,
  currentPageDone: false,
  consented: false,
  withdrawn: false,
  done: false,
  reset: false,
  totalWrites: 0,
  lastWrite: null,
  approxDataSize: 0,
  useSeed: true, // do you want to use a random seed based on the participant's ID?
  seedID: '',
  seedSet: false,
  viewSteppers: {},
  possibleConditions: {},
  seqtimeline: [],
  routes: [],
  conditions: {}, // tracking conditions both locally and remotely
  randomizedRoutes: {}, // tracking randomized route assignments both locally and remotely
}

const initGlobal = {
  // ephemeral state, resets on browser refresh
  progress: 0,
  forceNavigate: false,
  steppers: {}, // Store for useHStepper instances
  dbConnected: false,
  dbChanges: true,
  urls: {
    prolific: '?PROLIFIC_PID=XXXX&STUDY_ID=XXXX&SESSION_ID=XXXXX#/welcome/prolific/',
    cloudresearch:
      '#/welcome/cloudresearch/?assignmentId=123RVWYBAZW00EXAMPLE456RVWYBAZW00EXAMPLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3456EXAMPLE',
    mturk:
      '#/mturk/?assignmentId=123RVWYBAZW00EXAMPLE456RVWYBAZW00EXAMPLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3456EXAMPLE',
    citizensci:
      '#/welcome/citizensci/?CITIZEN_ID=XXXXX&CITIZEN_STUDY_ID=123RVWYBAZW00EXAMPLE&CITIZEN_SESSION_ID=AZ3456EXAMPLE',
    web: '#/welcome',
  },
}

/**
 * @module smilestore
 * @description Main Pinia store for managing SMILE application state.
 * Handles:
 * - Local storage state (persisted between sessions)
 * - Global ephemeral state (resets on refresh)
 * - Development configuration state
 * - Private user data
 * - Public experiment data
 * - Application configuration
 *
 * The store is divided into several namespaces:
 * - local: Persisted state synced with localStorage
 * - global: Ephemeral state that resets on refresh
 * - dev: Development-only state and configuration
 * - private: Sensitive user data not synced to database
 * - data: Public experiment data synced to database
 * - config: Application configuration settings
 */
export default defineStore('smilestore', {
  // arrow function recommended for full type inference
  state: () => ({
    local: useStorage(appconfig.localStorageKey, initLocal, localStorage, { mergeDefaults: true }),
    global: initGlobal,
    dev:
      appconfig.mode === 'development'
        ? useStorage(appconfig.devLocalStorageKey, initDev, localStorage, { mergeDefaults: true })
        : initDev,
    private: {
      recruitmentInfo: {},
      withdrawData: {},
      browserFingerprint: {}, // empty
    },
    data: {
      // syncs with firestore
      appStartTime: Date.now(),
      seedID: '',
      firebaseAnonAuthID: '',
      firebaseDocID: '',
      trialNum: 0, // not being updated correctly
      consented: false,
      verifiedVisibility: false,
      done: false,
      starttime: null, // time consented
      endtime: null, // time finished or withdrew
      recruitmentService: 'web', // fake
      browserData: [], // empty
      withdrawn: false, // false
      routeOrder: [],
      conditions: {},
      randomizedRoutes: {},
      smileConfig: removeFirestore(appconfig), //  adding config info to firebase document
      studyData: [],
    },
    config: appconfig,
  }),

  getters: {
    isDataBarVisible: (state) => state.dev.showConsoleBar,
    isKnownUser: (state) => state.local.knownUser,
    isConsented: (state) => state.local.consented,
    isWithdrawn: (state) => state.local.withdrawn,
    isDone: (state) => state.local.done,
    lastRoute: (state) => state.local.lastRoute,
    isDBConnected: (state) => state.global.dbConnected,
    hasAutofill: (state) => state.dev.pageProvidesAutofill,
    searchParams: (state) => state.dev.searchParams,
    recruitmentService: (state) => state.data.recruitmentService,
    isSeedSet: (state) => state.local.seedSet,
    getSeedID: (state) => state.local.seedID,
    getLocal: (state) => state.local,
    getConditions: (state) => state.local.conditions,
    getRandomizedRoutes: (state) => state.local.randomizedRoutes,
    verifiedVisibility: (state) => state.data.verifiedVisibility,
    getShortId: (state) => {
      if (!state.local.docRef || typeof state.local.docRef !== 'string') return 'N/A'
      //const lastDashIndex = state.local.docRef.lastIndexOf('-')
      return `${state.local.docRef.substring(0, 10)}`
    },
  },

  actions: {
    /**
     * Manually synchronizes local state to remote data store
     * @description Copies conditions, randomized routes, and seed ID from local state to the remote data store.
     * Used when database connection is restored after being offline.
     */
    manualSyncLocalToData() {
      // sync conditions to remote
      const log = useLog()
      log.debug('SMILESTORE: syncing conditions, randomized routes to remote')
      this.data.conditions = this.local.conditions
      this.data.randomizedRoutes = this.local.randomizedRoutes
      this.data.seedID = this.local.seedID
    },

    /**
     * Sets database connection status to connected and syncs local data
     * @description When transitioning from disconnected to connected state,
     * synchronizes local state data to the remote database before setting
     * the connection status to true. This ensures data consistency after
     * reconnecting.
     */
    setDBConnected() {
      if (this.global.dbConnected === false) {
        this.manualSyncLocalToData()
      }
      this.global.dbConnected = true
    },

    /**
     * Sets search parameters in dev state
     * @param {Object} searchParams - URL search parameters object to store
     * @description Updates the dev state's searchParams property with the provided search parameters.
     * Used to track and access URL query parameters throughout the application.
     */
    setSearchParams(searchParams) {
      this.dev.searchParams = searchParams
    },

    /**
     * Sets consent status to true and records start time
     * @description Updates both local and remote data stores to indicate participant has consented.
     * Also records the current timestamp as the experiment start time in the remote data store.
     */
    setConsented() {
      this.local.consented = true
      this.data.consented = true
      this.data.starttime = fsnow()
    },

    /**
     * Sets consent status to false
     * @description Updates both local and remote data stores to indicate participant has not consented.
     */
    setUnconsented() {
      this.local.consented = false
      this.data.consented = false
    },

    /**
     * Sets withdrawn status to true and records withdrawal time
     * @param {Object} forminfo - Form information object containing withdrawal details
     * @description Updates both local and remote data stores to indicate participant has withdrawn.
     * Also records the current timestamp as the withdrawal time in the remote data store.
     */
    setWithdrawn(forminfo) {
      this.local.withdrawn = true
      this.data.withdrawn = true
      this.private.withdrawData = forminfo
      this.data.endtime = fsnow()
    },

    /**
     * Sets done status to true and records end time
     * @description Updates both local and remote data stores to indicate participant has completed the experiment.
     * Also records the current timestamp as the completion time in the remote data store.
     */
    setDone() {
      this.local.done = true
      this.data.done = true
      this.data.endtime = fsnow()
    },

    /**
     * Sets completion code
     * @param {string} code - Completion code to set
     * @description Updates the local state with the provided completion code.
     */
    setCompletionCode(code) {
      this.local.completionCode = code
    },

    /**
     * Resets the application state
     * @description Resets the local state to its initial values.
     */
    resetApp() {
      this.local.reset = true
    },

    /**
     * Sets the seed ID
     * @param {string} seed - Seed ID to set
     * @description Updates the local state with the provided seed ID.
     */
    setSeedID(seed) {
      if (seed === this.local.seedID) {
        console.debug('SMILESTORE: seed already set to', seed)
        return
      }
      this.local.seedID = seed
      this.data.seedID = seed
      this.local.seedSet = true

      // After setting a seed we should clear out randomized settings
      this.local.conditions = {}
      this.local.randomizedRoutes = {}
      this.data.conditions = {}
      this.data.randomizedRoutes = {}
    },

    /**
     * Registers a stepper for a given view
     * @param {string} view - View name to register stepper for
     * @description Adds a new stepper object to the local state's viewSteppers array.
     */
    registerStepper(view) {
      if (this.local.viewSteppers[view] === undefined) {
        this.local.viewSteppers[view] = {}
      }
    },

    /**
     * Retrieves a stepper for a given view
     * @param {string} view - View name to get stepper for
     * @returns {Object} Stepper object for the given view
     * @description Returns the stepper object for the specified view from the local state.
     */

    getStepper(view) {
      return this.local.viewSteppers[view]
    },

    /**
     * Resets a stepper for a given view
     * @param {string} view - View name to reset stepper for
     * @description Resets the stepper object for the specified view in the local state.
     */
    resetStepper(view) {
      if (this.local.viewSteppers[view]) {
        this.local.viewSteppers[view] = {}
      }
    },

    /**
     * Records a window event
     * @param {string} type - Event type
     * @param {Object} [event_data] - Optional event data object
     * @description Records a window event in the browserData array.
     */
    recordWindowEvent(type, event_data = null) {
      if (event_data) {
        this.data.browserData.push({
          event_type: type,
          timestamp: fsnow(),
          event_data,
        })
      } else {
        this.data.browserData.push({
          event_type: type,
          timestamp: fsnow(),
        })
      }
    },

    /**
     * Retrieves browser fingerprint information
     * @returns {Promise<Object>} Browser fingerprint information
     * @description Retrieves browser fingerprint information from the IP address of the user.
     * This is not "real" browser fingerprinting, but it's close enough for our purposes.
     * It just finds things like browser version, OS, and IP address of user which can be helpful for debugging purposes.
     */
    getBrowserFingerprint() {
      // this is not "real" browser fingerprinting, but it's close enough for our purposes
      // it just finds things like browser version, OS, and IP address of user
      // which can be helpful for debugging purposes
      let ip = 'unknown'
      const log = useLog()
      // Make a request for a user with a given ID
      axios
        .get('https://api.ipify.org/?format=json')
        .then((response) => {
          // handle success

          // check if ip field exists
          if (response.data.ip) {
            ip = response.data.ip
            log.success('SMILESTORE: User IP address detected (using api.ipify.org): ' + ip)
          }
        })
        .catch((error) => {
          // handle error
          log.log(error)
        })
        .finally(() => {
          // always executed
          const { language } = window.navigator
          const { webdriver } = window.navigator
          const { userAgent } = window.navigator
          this.setFingerPrint(ip, userAgent, language, webdriver)
        })
    },

    /**
     * Sets browser fingerprint information
     * @param {string} ip - IP address of user
     * @param {string} userAgent - User agent string
     * @param {string} language - Browser language
     * @param {boolean} webdriver - Webdriver status
     * @description Sets the browser fingerprint information in the private state.
     */
    setFingerPrint(ip, userAgent, language, webdriver) {
      const log = useLog()
      this.private.browserFingerprint = {
        ip,
        userAgent,
        language,
        webdriver,
      }
      log.log('Browser fingerprint: ' + JSON.stringify(this.data.browserFingerprint))
    },

    /**
     * Sets autofill status
     * @param {Function} fn - Autofill function to set
     * @description Sets the autofill status in the dev state.
     */
    setAutofill(fn) {
      this.dev.pageProvidesAutofill = fn
    },

    /**
     * Removes autofill status
     * @description Removes the autofill status in the dev state.
     */
    removeAutofill() {
      this.dev.pageProvidesAutofill = null
    },

    /**
     * Sets recruitment service
     * @param {string} service - Recruitment service to set
     * @param {Object} info - Recruitment information object
     * @description Sets the recruitment service and information in the data and private states.
     */
    setRecruitmentService(service, info) {
      this.data.recruitmentService = service
      this.private.recruitmentInfo = info
    },

    /**
     * Autofills a page
     * @description If the page provides autofill, this function will call the autofill function.
     */
    autofill() {
      if (this.dev.pageProvidesAutofill) {
        this.dev.pageProvidesAutofill()
        const log = useLog()
        log.warn('DEV MODE: Page was autofilled by a user-provided component function')
      }
    },

    /**
     * Records data
     * @param {Object} data - Data to record
     * @description Records the provided data in the data state.
     */
    recordData(data) {
      this.data.studyData.push(JSON.parse(JSON.stringify(data)))
    },

    /**
     * Records a property
     * @param {string} name - Property name
     * @param {Object} data - Data to record
     * @description Records the provided data in the data state under the specified property name.
     */
    recordProperty(name, data) {
      this.data[name] = JSON.parse(JSON.stringify(data))
    },

    /**
     * Verifies visibility
     * @param {boolean} value - Visibility value
     * @description Records the provided visibility value in the data state.
     */
    verifyVisibility(value) {
      this.data.verifiedVisibility = value
    },

    /**
     * Sets a condition
     * @param {string} name - Condition name
     * @param {Object} cond - Condition object
     * @description Sets the condition in the local and data states.
     */
    setCondition(name, cond) {
      this.local.conditions[name] = cond
      this.data.conditions[name] = cond
    },

    /**
     * Sets a randomized route
     * @param {string} name - Route name
     * @param {Object} route - Route object
     * @description Sets the randomized route in the local and data states.
     */
    setRandomizedRoute(name, route) {
      this.local.randomizedRoutes[name] = route
      this.data.randomizedRoutes[name] = route
    },

    /**
     * Sets known user status
     * @description Sets the known user status in the local and data states.
     */
    async setKnown() {
      const log = useLog()
      // TODO: this need to have an exception handler wrapping around it
      // because things go wrong
      this.local.knownUser = true
      this.data.seedID = this.local.seedID
      this.local.docRef = await createDoc(this.data)
      this.local.privateDocRef = await createPrivateDoc(this.private, this.local.docRef)
      if (this.local.docRef) {
        this.setDBConnected()
      } else {
        log.error('SMILESTORE: could not create document in firebase')
      }
    },

    /**
     * Loads data from the database
     * @description Loads data from the database and sets the data state.
     */
    async loadData() {
      let data
      if (this.local.docRef) {
        data = await loadDoc(this.local.docRef)
        // ALSO WHAT IF THIS FAILS?
      }
      if (data) {
        this.data = data
        this.local.approxDataSize = sizeof(data)
        this.setDBConnected()
      }
    },

    /**
     * Sets the last route
     * @param {string} route - Route to set
     * @description Sets the last route in the local state.
     */
    setLastRoute(route) {
      this.local.lastRoute = route
      // if (route !== 'config') {
      //   this.local.lastRoute = route
      // }
    },

    /**
     * Records a route
     * @param {string} route - Route to record
     * @description Records a route in the data state.
     */
    recordRoute(route) {
      const currentTime = Date.now()

      // If there's a previous route, update its delta
      if (this.data.routeOrder.length > 0) {
        const lastIndex = this.data.routeOrder.length - 1
        const lastRoute = this.data.routeOrder[lastIndex]

        // Calculate and update the delta for the previous route
        this.data.routeOrder[lastIndex] = {
          ...lastRoute,
          timeDelta: currentTime - lastRoute.timestamp,
        }
      }

      // Add the new route without a delta (will be calculated on next route change)
      this.data.routeOrder.push({
        route,
        timestamp: currentTime,
        timeDelta: null, // Delta will be set when next route is recorded
      })
    },

    /**
     * Saves data to the database
     * @param {boolean} [force=false] - Whether to force the save
     * @description Saves the data to the database.
     */
    async saveData(force = false) {
      const log = useLog()
      if (this.isDBConnected) {
        if (!force && this.local.totalWrites >= appconfig.maxWrites) {
          log.error(
            'SMILESTORE: max writes reached to firebase.  Data NOT saved.  Call saveData() less numerously to avoid problems/cost issues.'
          )
          return
        }

        if (!force && this.local.lastWrite && Date.now() - this.local.lastWrite < appconfig.minWriteInterval) {
          log.error(
            `SMILESTORE: write interval too short for firebase (${appconfig.minWriteInterval}).  \
            Data NOT saved. Call saveData() less frequently to avoid problems/cost issues. See env/.env \
            file to alter this setting.`
          )
          // console.error(Date.now() - this.local.lastWrite)
          return
        }

        await updateSubjectDataRecord(this.data, this.local.docRef)
        await updatePrivateSubjectDataRecord(this.private, this.local.docRef)
        //console.log('data size = ', sizeof(data))
        this.local.approxDataSize = sizeof(this.data)
        this.local.totalWrites += 1
        this.local.lastWrite = Date.now()
        //this.global.snapshot = { ...smilestore.$state.data }
        this.global.dbChanges = false // reset the changes flag
        log.success('SMILESTORE: saveData() Request to firebase successful (force = ' + force + ')')
      } else if (!this.data.consented && !this.local.consented) {
        log.log('SMILESTORE: not saving because not consented')
      } else {
        log.error("SMILESTORE: can't save data, not connected to firebase")
      }
    },

    /**
     * Resets the local state
     * @description Resets the local state to its initial values.
     */
    resetLocal() {
      // this.local.knownUser = false
      // this.local.lastRoute = 'welcome'
      // this.global.dbConnected = false
      this.$reset()
    },

    /**
     * Gets a condition by name
     * @param {string} name - Condition name
     * @returns {Object} Condition object
     * @description Returns the condition object for the specified name from the local state.
     */
    getConditionByName(name) {
      return this.local.conditions[name]
    },

    /**
     * Gets a randomized route by name
     * @param {string} name - Route name
     * @returns {Object} Route object
     * @description Returns the route object for the specified name from the local state.
     */
    getRandomizedRouteByName(name) {
      return this.local.randomizedRoutes[name]
    },
  },
})
