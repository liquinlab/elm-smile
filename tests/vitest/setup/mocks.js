import { computed } from 'vue'
import { vi } from 'vitest'

// Mock Firebase-related methods
vi.mock('@/core/stores/firestore-db', () => ({
  createDoc: vi.fn().mockResolvedValue({ id: 'test-doc-id' }),
  createPrivateDoc: vi.fn().mockResolvedValue({ id: 'test-private-doc-id' }),
  updateSubjectDataRecord: vi.fn().mockResolvedValue(true),
  updatePrivateSubjectDataRecord: vi.fn().mockResolvedValue(true),
  loadDoc: vi.fn().mockResolvedValue({ data: () => ({ test: 'data' }) }),
  fsnow: vi.fn().mockReturnValue(new Date().toISOString()),
}))

// Mock axios for getBrowserFingerprint
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { ip: '127.0.0.1' } }),
  },
}))

// Mock randomization functions
vi.mock('@/core/randomization', () => ({
  randomInt: vi.fn(),
  shuffle: vi.fn(),
  sampleWithReplacement: vi.fn((arr) => arr[0]),
  sampleWithoutReplacement: vi.fn(),
  faker_distributions: {},
}))

// Mock useStepper
vi.mock('@/core/composables/useStepper', () => ({
  useStepper: vi.fn().mockReturnValue({
    currentStep: ref(1),
    totalSteps: ref(5),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    goToStep: vi.fn(),
    isFirstStep: computed(() => true),
    isLastStep: computed(() => false),
  }),
}))

// Mock meta.env
vi.mock('@/core/config', () => ({
  default: {
    mode: 'development',
    local_storage_key: 'smile_test',
    windowsizer_aggressive: false,
    windowsizer_request: { width: 800, height: 600 },
    max_writes: 100,
    min_write_interval: 1000,
    dev_local_storage_key: 'smile_dev_test',
  },
}))

// Mock API composable
vi.mock('@/core/composables/useAPI', () => ({
  default: () => ({
    isResetApp: () => false,
    getBrowserFingerprint: vi.fn().mockReturnValue('fake-browser-fingerprint-12345'),
    log: {
      warn: vi.fn((msg) => console.log(msg)),
      log: vi.fn((msg) => console.log(msg)),
      error: vi.fn((msg) => console.log(msg)),
      debug: vi.fn((msg) => console.log(msg)),
      clear_page_history: vi.fn(),
    },
    store: {
      removePageAutofill: vi.fn(),
      local: {
        useSeed: false,
        seqtimeline: [],
        routes: [],
      },
      dev: {
        page_provides_trial_stepper: false,
        current_page_done: false,
      },
      isKnownUser: true,
      isConsented: true,
      isDone: true,
      isDBConnected: true,
      isWithdrawn: false,
      lastRoute: 'Home',
      setLastRoute: vi.fn(),
      recordRoute: vi.fn(),
      getRandomizedRouteByNumber: () => vi.fn(),
      getRandomizedRouteByName: () => null,
      setRandomizedRoute: vi.fn(),
      getRandomizedRoute: () => null,
      registerPageTracker: vi.fn(),
      config: {
        mode: 'production',
      },
      global: {
        forceNavigate: true,
      },
    },
    config: {
      mode: 'production',
    },
    randomSeed: vi.fn(),
    completeConsent: vi.fn(),
    setDone: vi.fn(),
    resetApp: vi.fn(),
    resetLocalState: vi.fn(),
    getConfig: () => false,
    setRuntimeConfig: vi.fn(),
    setAppComponent: vi.fn(),
    randomAssignCondition: vi.fn(),
    sampleWithReplacement: vi.fn().mockReturnValue([0]),
    sampleWithoutReplacement: vi.fn().mockReturnValue([0]),
    randomInt: vi.fn().mockReturnValue(0),
    shuffle: vi.fn().mockImplementation((arr) => arr),
  }),
}))

// Mock smilestore
vi.mock('@/core/stores/smilestore', () => ({
  default: () => ({
    isKnownUser: true,
    isConsented: true,
    isDone: true,
    isDBConnected: true,
    isWithdrawn: false,
    lastRoute: 'Home',
    setLastRoute: vi.fn(),
    recordRoute: vi.fn(),
    config: {
      mode: 'production',
    },
    global: {
      forceNavigate: true,
    },
    store: {
      getRandomizedRouteByName: () => null,
    },
    getRandomizedRouteByName: () => null,
  }),
}))

// Setup global browser APIs
export function setupBrowserEnvironment() {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key) => {
        if (key === 'smile_seed') return 'test-seed'
        return null
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
    writable: true,
  })

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      search: '',
      pathname: '/',
      hash: '',
    },
    writable: true,
  })

  // Mock import.meta.env
  import.meta.env = {
    VITE_DEPLOY_BASE_PATH: '/test/',
  }

  // Mock import.meta.url
  import.meta.url = 'http://localhost:3000/src/core/composables/useAPI.js'
}

// Export mock implementations for direct access if needed
// export const mockImplementations = {
//   useAPI: vi.mocked(require('@/core/composables/useAPI').default),
//   smilestore: vi.mocked(require('@/core/stores/smilestore').default),
//   // Add other mocked modules as needed
// }
