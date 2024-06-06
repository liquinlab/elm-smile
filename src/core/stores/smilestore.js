import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import axios from 'axios'
import appconfig from '@/core/config'

import {
  createDoc,
  createPrivateDoc,
  updateSubjectDataRecord,
  updatePrivateSubjectDataRecord,
  loadDoc,
  fsnow,
} from './firestore-db'
import sizeof from 'firestore-size'

import useLog from '@/core/stores/log'

function initLastRoute(mode) {
  if (mode === 'development') {
    return 'recruit'
  }
  if (mode === 'presentation') {
    return 'presentation_home'
  }
  return 'landing'
}

function removeFirestore(config) {
  const { firebaseConfig, ...rest } = config
  return rest
}

const init_dev = {
  // syncs with local storage
  page_provides_autofill: null,
  page_provides_trial_stepper: false,
  show_data_bar: false,
  data_bar_height: 370,
  data_bar_tab: 'database',
  search_params: '',
  log_filter: 'All',
  notification_filter: 'Errors only',
  last_page_limit: false,
  data_path: null,
  config_panel: { type: 'local', visible: false, x: -280, y: 0 },
  state_var_panel: { visible: false, x: -150, y: 0 },
  randomization_panel: { visible: false, x: -130, y: 0 },
  route_panel: { visible: false, x: -0, y: -3 },
}

const init_local = {
  // syncs with local storage
  knownUser: false,
  lastRoute: initLastRoute(appconfig.mode),
  docRef: null,
  privateDocRef: null,
  completionCode: null,
  current_page_done: false,
  consented: false,
  withdrawn: false,
  done: false,
  totalWrites: 0,
  lastWrite: null,
  approx_data_size: 0,
  seedActive: true, // do you want to use a random seed based on the participant's ID?
  seedID: '',
  seedSet: false,
  pageTracker: {},
  possibleConditions: {},
}

const init_global = {
  // ephemeral state, resets on browser refresh
  progress: 0,
  forceNavigate: false,
  db_connected: false,
  db_changes: true,
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

export default defineStore('smilestore', {
  // arrow function recommended for full type inference
  state: () => ({
    local: useStorage(appconfig.local_storage_key, init_local, localStorage, { mergeDefaults: true }),
    global: init_global,
    dev:
      appconfig.mode === 'development'
        ? useStorage(appconfig.dev_local_storage_key, init_dev, localStorage, { mergeDefaults: true })
        : init_dev,
    private: {
      recruitment_info: {},
      withdraw_data: {},
      browser_fingerprint: {}, // empty
    },
    data: {
      // syncs with firestore
      seedID: '',
      trial_num: 0, // not being updated correctly
      consented: false,
      verified_visibility: false,
      done: false,
      starttime: null, // time consented
      endtime: null, // time finished or withdrew
      recruitment_service: 'web', // fake
      browser_data: [], // empty
      // demographic_form: {}, // empty
      // device_form: {}, // empty
      withdrawn: false, // false
      route_order: [],
      conditions: {},
      smile_config: removeFirestore(appconfig), //  adding config info to firebase document
      study_data: [],
    },
    config: appconfig,
  }),

  getters: {
    isDataBarVisible: (state) => state.dev.show_data_bar,
    isKnownUser: (state) => state.local.knownUser,
    isConsented: (state) => state.local.consented,
    isWithdrawn: (state) => state.local.withdrawn,
    isDone: (state) => state.local.done,
    lastRoute: (state) => state.local.lastRoute,
    isDBConnected: (state) => state.global.db_connected,
    hasAutofill: (state) => state.dev.page_provides_autofill,
    searchParams: (state) => state.dev.search_params,
    recruitmentService: (state) => state.data.recruitment_service,
    isSeedSet: (state) => state.local.seedSet,
    getSeedID: (state) => state.local.seedID,
    getLocal: (state) => state.local,
    getPage: (state) => state.local.pageTracker,
    getPossibleConditions: (state) => state.local.possibleConditions,
    getConditions: (state) => state.data.conditions,
    verifiedVisibility: (state) => state.data.verified_visibility,
  },

  actions: {
    setDBConnected() {
      this.global.db_connected = true
    },
    setSearchParams(search_params) {
      this.dev.search_params = search_params
    },
    setConsented() {
      this.local.consented = true
      this.data.consented = true
      this.data.starttime = fsnow()
    },
    setUnconsented() {
      this.local.consented = false
      this.data.consented = false
    },
    setWithdrawn(forminfo) {
      this.local.withdrawn = true
      this.data.withdrawn = true
      this.private.withdraw_data = forminfo
      this.data.endtime = fsnow()
    },
    setDone() {
      this.local.done = true
      this.data.done = true
      this.data.endtime = fsnow()
    },
    setCompletionCode(code) {
      this.local.completionCode = code
    },
    setSeedID(seed) {
      this.local.seedID = seed
      this.data.seedID = seed
      this.local.seedSet = true
    },
    registerPageTracker(page) {
      const log = useLog()
      if (this.local.pageTracker[page] === undefined) {
        this.local.pageTracker[page] = 0
      }
    },
    getPageTracker(page) {
      return this.local.pageTracker[page]
    },
    incrementPageTracker(page) {
      const log = useLog()
      if (this.local.pageTracker[page] !== undefined) {
        this.local.pageTracker[page] += 1
        return this.local.pageTracker[page]
      } else {
        log.error('SMILESTORE: page tracker not initialized for page', page)
      }
    },
    decrementPageTracker(page) {
      const log = useLog()
      if (this.local.pageTracker[page] !== undefined) {
        this.local.pageTracker[page] -= 1
        if (this.local.pageTracker[page] < 0) {
          this.local.pageTracker[page] = 0
        }
        return this.local.pageTracker[page]
      } else {
        log.error('SMILESTORE: page tracker not initialized for page', page)
      }
    },
    resetPageTracker(page) {
      if (this.local.pageTracker[page]) {
        this.local.pageTracker[page] = 0
      }
    },
    recordWindowEvent(type, event_data = null) {
      if (event_data) {
        this.data.browser_data.push({
          event_type: type,
          timestamp: fsnow(),
          event_data,
        })
      } else {
        this.data.browser_data.push({
          event_type: type,
          timestamp: fsnow(),
        })
      }
    },
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
    setFingerPrint(ip, userAgent, language, webdriver) {
      const log = useLog()
      this.private.browser_fingerprint = {
        ip,
        userAgent,
        language,
        webdriver,
      }
      log.log('Browser fingerprint: ' + JSON.stringify(this.data.browser_fingerprint))
    },
    setPageAutofill(fn) {
      this.dev.page_provides_autofill = fn
    },
    removePageAutofill() {
      this.dev.page_provides_autofill = null
    },
    setRecruitmentService(service, info) {
      this.data.recruitment_service = service
      this.private.recruitment_info = info
    },
    autofill() {
      if (this.dev.page_provides_autofill) {
        this.dev.page_provides_autofill()
        const log = useLog()
        log.warn('DEV MODE: Page was autofilled by a user-provided component function')
      }
    },
    saveTrialData(data) {
      this.data.study_data.push(data)
    },
    saveForm(name, data) {
      this.data[name + '_form'] = data
    },
    verifyVisibility(value) {
      this.data.verified_visibility = value
    },
    setCondition(name, cond) {
      this.data.conditions[name] = cond
    },
    async setKnown() {
      const log = useLog()
      // TODD: this need to have an exception handler wrapping around it
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
    async loadData() {
      let data
      if (this.local.docRef) {
        data = await loadDoc(this.local.docRef)
        // ALSO WHAT IF THIS FAILS?
      }
      if (data) {
        this.data = data
        this.local.approx_data_size = sizeof(data)
        this.setDBConnected()
      }
    },
    setLastRoute(route) {
      this.local.lastRoute = route
      // if (route !== 'config') {
      //   this.local.lastRoute = route
      // }
    },
    recordRoute(route) {
      this.data.route_order.push(route)
    },
    async saveData(force = false) {
      const log = useLog()
      if (this.isDBConnected) {
        if (!force && this.local.totalWrites >= appconfig.max_writes) {
          log.error(
            'SMILESTORE: max writes reached to firebase.  Data NOT saved.  Call saveData() less numerously to avoid problems/cost issues.'
          )
          return
        }

        if (!force && this.local.lastWrite && Date.now() - this.local.lastWrite < appconfig.min_write_interval) {
          log.error(
            `SMILESTORE: write interval too short for firebase (${appconfig.min_write_interval}).  \
            Data NOT saved. Call saveData() less frequently to avoid problems/cost issues. See env/.env \
            file to alter this setting.`
          )
          // console.error(Date.now() - this.local.lastWrite)
          return
        }
        await updateSubjectDataRecord(this.data, this.local.docRef)
        await updatePrivateSubjectDataRecord(this.private, this.local.docRef)
        //console.log('data size = ', sizeof(data))
        this.local.approx_data_size = sizeof(this.data)
        this.local.totalWrites += 1
        this.local.lastWrite = Date.now()
        //this.global.snapshot = { ...smilestore.$state.data }
        this.global.db_changes = false // reset the changes flag
        log.success('SMILESTORE: saveData() Request to firebase successful (force = ' + force + ')')
      } else {
        log.error("SMILESTORE: can't save data, not connected to firebase")
      }
    },
    resetLocal() {
      // this.local.knownUser = false
      // this.local.lastRoute = 'welcome'
      // this.global.db_connected = false
      this.$reset()
    },
  },
})
