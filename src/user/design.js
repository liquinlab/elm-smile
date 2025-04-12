// design.js
// This file configures the overall logic of your experiment.
// The critical part is the timeline, which is a list of phases
// the experiment goes through.  This file configues which phase
// occurs in the sequence.

// The key documentation for this file
// Views: https://smile.gureckislab.org/views.html
// Timeline: https://smile.gureckislab.org/timeline.html
// Randomization: https://smile.gureckislab.org/randomization.html
import { markRaw } from 'vue'
import { processQuery } from '@/core/utils'

// 1. Import main built-in View components
import Advertisement from '@/builtins/advertisement/AdvertisementView.vue'
import MTurk from '@/builtins/mturk/MTurkRecruitView.vue'
import Consent from '@/builtins/simple_consent/InformedConsentView.vue'
import DemographicSurvey from '@/builtins/demographic_survey/DemographicSurveyView.vue'
import DeviceSurvey from '@/builtins/device_survey/DeviceSurveyView.vue'
import Captcha from '@/builtins/captcha/CaptchaView.vue'
import Instructions from '@/builtins/instructions/InstructionsView.vue'
import InstructionsQuiz from '@/builtins/instructions_quiz/InstructionsQuiz.vue'
import Debrief from '@/builtins/debrief/DebriefView.vue'
import TaskFeedbackSurvey from '@/builtins/task_survey/TaskFeedbackSurveyView.vue'
import Thanks from '@/builtins/thanks/ThanksView.vue'
import Withdraw from '@/builtins/withdraw/WithdrawView.vue'
import WindowSizer from '@/builtins/window_sizer/WindowSizerView.vue'

// 2. Import user View components
import Exp from '@/builtins/tasks/ExpView.vue'
import Task1 from '@/builtins/tasks/Task1View.vue'
import Task2 from '@/builtins/tasks/Task2View.vue'
import StroopExp from '@/user/components/stroop_exp/StroopView.vue'

// #3. Import smile API and timeline
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import Timeline from '@/core/timeline'
const timeline = new Timeline(api)

import useSmileStore from '@/core/stores/smilestore'
import { onBeforeRouteLeave } from 'vue-router'
const smilestore = useSmileStore()

// #4.  Set runtime configuration options
//      See http://smile.gureckislab.org/configuration.html#experiment-options-env
api.setRuntimeConfig('allowRepeats', false)

api.setRuntimeConfig('windowsizerRequest', { width: 800, height: 600 })
api.setRuntimeConfig('windowsizerAggressive', true)

api.setRuntimeConfig('anonymousMode', false)
api.setRuntimeConfig('labURL', 'https://gureckislab.org')
api.setRuntimeConfig('brandLogoFn', 'universitylogo.png')

api.setRuntimeConfig('maxWrites', 1000)
api.setRuntimeConfig('minWriteInterval', 2000)
api.setRuntimeConfig('autoSave', true)

api.setRuntimeConfig('payrate', '$15USD/hour prorated for estimated completition time + performance related bonus')

// get rid of these two?
api.setRuntimeConfig('estimated_time', '30-40 minutes')
api.setRuntimeConfig('payrate', '$15USD/hour prorated for estimated completition time + performance related bonus')

// set the informed consent text on the menu bar
import InformedConsentText from './components/InformedConsentText.vue'
api.setAppComponent('informed_consent_text', InformedConsentText)

// #5. Add between-subjects condition assignment
// This is where you can define conditions to which each participant should be assigned

// You can assign conditions by passing a javascript object to api.randomAssignCondition(),
// where the key is the condition name and the value is an array of possible condition values.
// Each unique condition manipulation should be assigned via a separate call to setConditions.

api.randomAssignCondition({
  taskOrder: ['AB', 'BA'],
})

api.randomAssignCondition({
  variation: ['alpha', 'beta'],
})

// you can also optionally set randomization weights for each condition. For
// example, if you want twice as many participants to be assigned to instructions
// version 1 compared to versions 2 and 3, you can set the weights as follows:
api.randomAssignCondition({
  instructionsVersion: ['1', '2', '3'],
  weights: [2, 1, 1], // weights are automatically normalized, so [4, 2, 2] would be the same
})

// #6. Define and add some routes to the timeline
// Each route should map to a View component.
// Each needs a name
// but for most experiments they go in sequence from the begining
// to the end of this list

// by default routes have meta.requiresConsent = true (unless you manually override it)
// by default routes have meta.requiresDone = false (unless you manually override it)

// IMPORTANT: A least one route needs to be called 'welcome_anonymous'
// to handle the landing case for someone not coming from a recruitment service

// First welcome screen for non-referral
timeline.pushSeqView({
  path: '/welcome',
  name: 'welcome_anonymous',
  component: Advertisement,
  meta: {
    prev: undefined,
    next: 'consent',
    allowAlways: true,
    requiresConsent: false,
  }, // override what is next
  beforeEnter: (to) => {
    api.getBrowserFingerprint()
  },
})

// welcome screen for referral from a service (e.g., prolific)
timeline.pushSeqView({
  path: '/welcome/:service',
  name: 'welcome_referred',
  component: Advertisement,
  meta: {
    prev: undefined,
    next: 'consent',
    allowAlways: true,
    requiresConsent: false,
  },
  beforeEnter: (to) => {
    // processes info to get the service-specific
    // participant info (e.g., Profilic ID)
    processQuery(to.query, to.params.service)
    api.getBrowserFingerprint()
  },
})

// this is a the special page that loads in the iframe on mturk.com
timeline.registerView({
  name: 'mturk',
  component: MTurk,
  props: {
    estimated_time: api.getConfig('estimated_time'),
    payrate: api.getConfig('payrate'),
  },
  meta: { allowAlways: true, requiresConsent: false },
  beforeEnter: (to) => {
    processQuery(to.query, 'mturk')
  },
})

// import the consent text
// consent
timeline.pushSeqView({
  name: 'consent',
  component: Consent,
  props: {
    informedConsentText: markRaw(InformedConsentText), // provide the informed consent text
  },
  meta: {
    requiresConsent: false,
    setConsented: true,
  },
})

// demographic survey
timeline.pushSeqView({
  name: 'demograph',
  component: DemographicSurvey,
})

// windowsizer
timeline.pushSeqView({
  name: 'windowsizer',
  component: WindowSizer,
})

// captcha
timeline.pushSeqView({
  name: 'captcha',
  component: Captcha,
})

// instructions
timeline.pushSeqView({
  name: 'instructions',
  component: Instructions,
})

// import the quiz questions
import { QUIZ_QUESTIONS } from './components/quizQuestions'
// instructions quiz
timeline.pushSeqView({
  name: 'quiz',
  component: InstructionsQuiz,
  props: {
    questions: QUIZ_QUESTIONS,
    returnTo: 'instructions',
    randomizeQandA: true,
  },
})

// main experiment
// note: by default, the path will be set to the name of the view
// however, you can override this by setting the path explicitly
timeline.pushSeqView({
  name: 'exp',
  path: '/experiment',
  component: Exp,
})

////// example of randomized branching routes
// (you can also have conditional branching based on conditions -- see docs)

// routes must be initially registered, to tell the timeline they exist
timeline.registerView({
  name: 'task1',
  component: Task1,
})

timeline.registerView({
  name: 'task2',
  component: Task2,
})

timeline.pushRandomizedNode({
  name: 'RandomSplit',
  options: [['task1'], ['task2']],
})

// stroop exp
timeline.pushSeqView({
  name: 'stroop',
  component: StroopExp,
})

// debriefing form
import DebriefText from '@/user/components/DebriefText.vue' // get access to the global store
timeline.pushSeqView({
  name: 'debrief',
  component: Debrief,
  props: {
    debriefText: markRaw(DebriefText),
  },
})

// device survey
timeline.pushSeqView({
  name: 'device',
  component: DeviceSurvey,
})

// debriefing form
timeline.pushSeqView({
  name: 'feedback',
  component: TaskFeedbackSurvey,
  meta: { setDone: true }, // this is the last form
})

// thanks/submit page
timeline.pushSeqView({
  name: 'thanks',
  component: Thanks,
  meta: {
    requiresDone: true,
    resetApp: api.getConfig('allowRepeats'),
  },
})

// this is a special page that is for a withdraw
timeline.registerView({
  name: 'withdraw',
  meta: {
    requiresWithdraw: true,
    resetApp: api.getConfig('allowRepeats'),
  },
  component: Withdraw,
})

timeline.build()

export default timeline
