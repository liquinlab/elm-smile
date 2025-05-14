<script setup>
//import AdvertisementView from '../src/builtins/recruitment/AdvertisementView.vue'
</script>

# :building_construction: Views

[Components](/components) are the basic building blocks of a <SmileText/>
experiment. However, components can play different roles. In <SmileText />, each
major phase of an experiment is associated with its own special
[component](/components) called a "View". (We will refer to Views using a
capital 'V' to distinguish them from ordinary uses of the word "view."). Other
packages might refer to View elements as "pages", "routes", "sections", "parts",
or "phases."

<img src="/images/viewstimeline.png" width="800" alt="timeline example" style="margin: auto;">

To help make clear the distinction between a View and an ordinary component,
consider the following examples:

- A consent form might be one View but be composed of many components (e.g., a
  consent text component, a signature component, a submit button component,
  etc...).
- A welcome page might be one View but be composed of many components (e.g., a
  welcome text component, a start button component, etc...).
- A block of trials in an experiment might be one View but be composed of many
  components (e.g., a trial component, a fixation component, a feedback
  component, etc...).

Each View is associated with one Vue component that is responsible for rendering
the content of that View. A View can, of course, be made up of many smaller
components. By convention, the filename of any component that is treated as a
View should end in `View.vue` for example `WelcomeView.vue`, `ConsentView.vue`,
etc...

Views are a useful way of thinking about bigger parts or phases of an
experiment. Views tend be to modular and reusable "sections" of an experiment
that you might use in different experiments or different parts of the same
experiment. The sequencing of different Views is controlled by the
[**Timeline**](/timeline) (and more specifically `@/user/design.js`).

## Built-in Views

When you [setup](/starting) the default <SmileText /> project you automatically
get a number of built-in Views that are useful for most experiments. These
include things like obtaining [informed consent](#informed-consent), presenting
[instructions](#simple-instructions), [CAPTCHAs](#the-smile-captcha), etc...
This section describes these default built-in Views and provides an overview of
how to customize them for your experiment.

### Side effects

Views sometimes have "side-effects" which are changes to the state of the
overall application as a result of the operation of the view. For example, the
Informed Consent View might present the text of the consent form and ask the
participant if they agree to participate. If they do, then a flag is set by the
[API](/api) to indicate that the participant has consented. Subsequent Views
might check this flag to verify that the subject has consented.

Programmers call these "side-effects" because they break the apparent modularity
of the View. For example, if your experiment needs to know if the participant
has consented, and you remove the Informed Consent View, then you will need to
add some other way to set the consent flag.

Below, we describe each built-in View, including the side-effects of each View.

### Metadata options

Each View can also be defined with a set of metadata properties that control
page access. These `meta` property will be configured in the `@/user/design.js`.
Examples on all of the metadata properties will be shown in the below examples,
and more information can be found
[here](https://router.vuejs.org/guide/advanced/meta.html#Route-Meta-Fields).

## Overview of Built-in Views

| Name                                                | Side&nbsp;effect? | Description                                                                                                                               |
| --------------------------------------------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| [Recruitment Ad](#recruitment-advertisement)        | No                | Landing page for participants                                                                                                             |
| [MTurk Ad](#mturk-recruitment)                      | No                | Interacts with the MTurk system                                                                                                           |
| [Simple Informed Consent](#simple-informed-consent) | Yes               | Collects informed consent using a simple checkbox                                                                                         |
| [CAPTCHA](#the-smile-captcha)                       | No                | Fun tasks to verify human-ness and attention                                                                                              |
| [Window Sizer](#window-sizer)                       | Yes               | Verifies a given area of the screen is visible (with a more aggressive option that hides page content if the window is resized too small) |
| [Simple Instructions](#simple-instructions)         | No                | A simple sequence of pages for instructions                                                                                               |
| [Instructions Quiz](#instructions-quiz)             | No                | A basic instructions quiz                                                                                                                 |
| [Demographic Survey](#demographic-survey)           | No                | A survey which collects some demographic info                                                                                             |
| [Device Survey](#device-survey)                     | No                | A survey which collects some self-report about computer/device                                                                            |
| [Withdraw](#withdraw)                               | Yes               | A survey which processes a participant's request to withdraw from study                                                                   |
| [Debrief](#debrief)                                 | No                | A simple text View which describes the purpose of study                                                                                   |
| [Feedback](#feedback)                               | No                | A survey for soliciting structured and unstructured feedback on the study                                                                 |
| [Thanks Page](#thanks)                              | Yes               | A thank you page                                                                                                                          |
| [Report Issue](#report-issue)                       | Yes               | A form to report a bug/issue with the experiment                                                                                          |

These components are located in the `src/builtins` directory. In <SmileText/> a
short-hand for the src folder is '@' so for instance '@/builtins' refers to the
`src/builtins` directory.

## Built-in Views

### Recruitment Advertisement

**Base Component**: `@/builtins/recruitment/AdvertisementView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/recruitment/AdvertisementView.vue)  
**Side
effects**: None  
**Typical accessibility**: `{allowAlways: true}`

Before a participant can begin a study, they must first be recruited. The
landing page for your experiment is the Advertisement View. This is the first
thing that participants will see when they visit your experiment. The
Advertisement View is a simple page that contains a title and an invitation to
participate. There is a animated button which will take the participant to the
next View in the timeline.

- There are no side effects, and nothing is recorded.
- The template can be edited to change the text.
- The logo image imports from `@/user/assets/brain.svg`.

<AdvertisementView/>

Example `design.js` entry:

```js
// put this at the top of the file
import Advertisement from '@/builtins/advertisement/AdvertisementView.vue'

timeline.pushSeqView({
  path: '/welcome',
  name: 'welcome_anonymous',
  component: Advertisement,
  meta: {
    prev: undefined,
    next: 'consent',
    allowAlways: true,
    requiresConsent: false,
  },
})
```

Another `design.js` alternative for studies that use external services like
Prolific:

```js
// put this at the top of the file
import Advertisement from '@/builtins/advertisement/AdvertisementView.vue'

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
  },
})
```

This will automatically save service-specific participant info to your data
(e.g., Prolific ID), with current built-in support for Prolific, Amazon MTurk,
and CloudResearch.

### MTurk Recruitment

**Base Component**: `@/builtins/mturk/MTurkRecruitView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/mturk/MTurkRecruitView.vue)  
**Side
effects**: None  
**Typical accessibility**: `{allowAlways: true}`

On the Mechanical Turk, the platform lists possible HITs (Human Intelligence
Tasks) and workers can choose to complete them. When browsing the listing
participants see one "advertisement" view of the task in an `iframe`. When
browsing in this listing the assignmentId is set to
`ASSIGNMENT_ID_NOT_AVAILABLE`. If they accept the HIT, then the task begins and
a new window opens with the actual task. At this point a valid assignmentId will
be provided.

This View provides the logic to handle these two versions of the recruitment
text. When the assignmentId is not available the participant sees the
"recruitment" text with some information about the study. When they accept the
HIT, they then see a new page with a button which will launch the <SmileText/>
experiment in a new browser window.

- There are no side effects, and nothing is recorded.
- The template can be edited to change the text.
- The logo image imports from `@/user/assets/brain.svg`.

```js
// put this at the top of the file
import MTurk from '@/builtins/mturk/MTurkRecruitView.vue'

this.registerView({
  path: '/mturk',
  name: 'mturk',
  component: MTurk,
  meta: { allowAlways: true, requiresConsent: false },
  beforeEnter: (to) => {
    processQuery(to.query, 'mturk')
  },
})
```

### Simple Informed Consent

**Base Component**: `@/builtins/simple_consent/InformedConsentView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/simple_consent/InformedConsentView.vue)  
**Side
effects**: Sets the `consent` key in the `localStorage` to `true.`  
**Typical accessibility**: `{requiresConsent: false, requiresDone: false}`

Most studies require some type of informed consent from participants. This is
usually a short piece of text describing the study and the participant's rights
and responsibilities. The Informed Consent View is a simple page that displays
this text and asks the participant to agree to participate by clicking a
checkbox. If the participant agrees, then the Informed Consent View sets a flag
in the application state indicating that the participant has consented. Clicking
a button continues to the next View in the timeline.

The text of the informed consent should be updated for each study and placed in
`@/user/components/InformedConsentText.vue`.

After a participant accepts the informed consent (usually the first few steps of
study) they will see a button in the [status bar](#status-bar) that will always
be available allowing them to review the consent form in case they have
questions. Clicking this button pops up a modal with the text of the informed
consent (also `@/builtins/simple_consent/InformedConsentText.vue`).

```js
// put this at the top of the file
import Consent from '@/builtins/simple_consent/InformedConsentView.vue'

// consent
timeline.pushSeqView({
  name: 'consent',
  component: Consent,
  meta: {
    requiresConsent: false,
    setConsented: true, // set the status to consented ater this route
  },
})
```

### The Smile CAPTCHA

**Base Component**: `@/builtins/captcha/CaptchaView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/captcha/CaptchaView.vue)  
**Side
effects**: Yes, saves the data from the tasks.  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

CAPTHCAs (Completely Automated Public Turing test to tell Computers and Humans
Apart) are simple tasks used to verify that the user is a human and not a
computer. We developed a unique CAPTCHA system for <SmileText/> that is fun and
engaging for participants. The Smile CAPTCHA is a series of tasks that are easy
for humans but difficult for computers. The tasks happen quickly in sequence
with a timer requiring fast responses (limiting the ability to send the
questions to an AI). In addition, the set of tasks is diverse and requires
language understanding, intuitive physical reasoning, fine motor control and
perception, and object recognition. A few of the tasks measure known cognitive
phenomena specific to humans, such as patterns in reaction time.

<SmileText/> we use a simple CAPTCHA that asks the participant to click on a
specific location on the screen. This is a simple task that is easy for humans
but difficult for computers.

(THIS IS IN DEVELOPMENT)

```js
// captcha
timeline.pushSeqView({
  path: '/captcha',
  name: 'captcha',
  component: Captcha,
})
```

### Window Sizer

**Base Component**: `@/builtins/window_sizer/WindowSizerView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/window_sizer/WindowSizerView.vue)  
**Side
effects**: Yes, sets the is verifiedVisibility key in the [API](/api) to true.  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

The window sizer is a small component `src/components/pages/WindowSizerView.vue`
that will display a box with a configured size on the screen and ask the
participant to adjust their browser window to that size so everything is
visible. It looks like this:

![Window sizer](/images/windowsizer.png)

The size of the box is configured in `env/.env` file using the
`VITE_WINDOWSIZER_REQUEST` configuration option. The default value is `800x600`
which means 800 pixel wide and 600 pixels tall. You can change these values as
needed. In development mode, you will need to restart the development server
since environment files are only read once when the application first loads.

In addition to a View appearing on the Timeline in a particular place, it is
possible to re-trigger this View when the browser detects the user has adjusted
the browser to no longer make the task viewport the requested size. To enable
this behavior set `VITE_WINDOWSIZER_AGGRESSIVE = true` in the `env/.env` file.

To add it to the timeline just add this in the appropriate place inside
`src/router.js`;

```js
// put this at the top of the file
import WindowSizer from '@/builtins/window_sizer/WindowSizerView.vue'

// windowsizer
timeline.pushSeqView({
  path: '/windowsizer',
  name: 'windowsizer',
  component: WindowSizer,
})
```

### Simple Instructions

This page presents the instructions for the experimental task to the
participant. If the experiment contains multiple conditions and each requires a
unique set of instructions, the participant may be randomly assigned a condition
with custom weights so that the Instructions View displays the correct text.
This page is also always accessible such that the user is able to return to it
if they do not pass the instructions quiz.

**Base Component**: `@/builtins/instructions/InstructionsView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/instructions/InstructionsView.vue)  
**Side
effects**: No  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

[TO DO: Add info about instructions]

```js
// put this at the top of the file
import Instructions from '@/builtins/instructions/InstructionsView.vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

// assign instruction condition
api.randomAssignCondition({
  instructionsVersion: ['1', '2', '3'],
  weights: [2, 1, 1],
})

// instructions
timeline.pushSeqView({
  name: 'instructions',
  component: Instructions,
  meta: {
    allowAlways: true,
  },
})
```

### Instructions Quiz

**Component**: `@/builtins/instructions_quiz/InstructionsQuiz.vue`  
**Side effects**: Saves the data from the quiz  
**Typical accessibility**: Always

The instructions quiz is a simple quiz that makes sure the participant has read
and understood the experiment instructions. The user has to answer all the
questions correctly before they can continue. If they get a question wrong, they
are redirected to the timeline at the location specified in the `returnTo` prop,
which is by default the instructions page, and will be asked to try the quiz
again.

The quiz questions are configured in `@/user/components/quizQuestions.js` as an
array of dictionary objects, where each dictionary represents a page of multiple
questions. Each question has an id, a question text, a list of answers, and the
correct answer(s). The field `multiSelect` can be set to true if a question has
multiple correct answers.

```js
export const QUIZ_QUESTIONS = [
  {
    page: 1,
    questions: [
      {
        id: 'example1',
        question: 'What color is the sky?',
        multiSelect: false,
        answers: ['red', 'blue', 'yellow', 'rainbow'],
        correctAnswer: ['blue'],
      },
      {
        id: 'example2',
        question: 'How many days are in a non-leap year?',
        multiSelect: false,
        answers: ['365', '100', '12', '31', '60'],
        correctAnswer: ['365'],
      },
    ],
  },
  {
    page: 2,
    questions: [
      {
        id: 'example3',
        question: 'What comes next: North, South, East, ___',
        multiSelect: false,
        answers: ['Southeast', 'Left', 'West'],
        correctAnswer: ['West'],
      },
      {
        id: 'example4',
        question: "What's 7 x 7?",
        multiSelect: false,
        answers: ['63', '59', '49', '14'],
        correctAnswer: ['49'],
      },
    ],
  },
]
```

The questions from `@/user/components/quizQuestions.js` are then imported and
passed to `InstructionsQuiz` component as a prop (`quizQuestions`). The
`randomizeQuestionsAndAnswers` prop is optional and defaults to `true`. This
will randomize the order of the questions and answers on each page at loading
time (meaning if the subject repeats the quiz multiple times, the order of the
questions and answers will be different each time). If set to `false`, the
questions will be randomized in the same way each time the quiz is taken.

```js
// import the quiz questions
import { QUIZ_QUESTIONS } from './components/quizQuestions'
// instructions quiz
timeline.pushSeqView({
  name: 'quiz',
  component: InstructionsQuiz,
  props: {
    quizQuestions: QUIZ_QUESTIONS,
    returnTo: 'instructions',
    randomizeQuestionsAndAnswers: true,
  },
})
```

### Demographic Survey

**Base Component**: `@/builtins/demographic_survey/DemographicSurveyView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/demographic_survey/DemographicSurveyView.vue)  
**Side
effects**: Yes, saves the data from the form.  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

The demographic survey is a simple survey that asks participants to provide some
information about themselves. This is important for many reasons. For example,
it is often important to report information about the demographics of the
participants in a study (age, gender, country, primary language, etc...). In
addition, it is useful to know if a subject is color blind in case the studies
relies on color information. The demongr

```js
// put this at the top of the file
import DemographicSurvey from '@/builtins/demographic_survey/DemographicSurveyView.vue'

timeline.pushSeqView({
  path: '/demograph',
  name: 'demograph',
  component: DemographicSurvey,
})
```

### Device Survey

**Base Component**: `@/builtins/device_survey/DeviceSurveyView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/device_survey/DeviceSurveyView.vue)  
**Side
effects**: Yes, saves the data from the form.  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

The device survey askes participants to provide some information about their
computer/tablet/etc... This is important because sometimes the information
obtained automatically from the browser is incorrect. It is also sometimes
impossible to know aspects of a users computer setup. For instance, it might be
important to know what type of pointer device a participant is using (e.g.,
mouse, trackpad, touch screen). This information is useful for debugging and for
understanding the data and analyzing it depending on your research question. The
default survey asks for the following information:

- What type of device are you using? (e.g., desktop, laptop, tablet, phone)
- What type of internet connection are you using? (e.g., wifi, ethernet,
  cellular)
- How good is your internet connection today? (e.g., good, poor)
- What webbrowser are you using? (e.g., Chrome, Firefox, Safari, Edge, other)
- How did you move the cursor? (e.g., mouse, trackpad, touchscreen, other)
- Are you using any assistive technology? (e.g., screen reader, magnifier,
  other)
- Did you use any tools to help you complete the task? (e.g., calculator, notes,
  browser extensions, AI tools, other)

If you want this to be the last View in the study you can set the `setDone` meta
field.

```js
// put this at the top of the file
import DeviceSurvey from '@/builtins/device_survey/DeviceSurveyView.vue'

timeline.pushSeqView({
  path: '/demograph',
  name: 'demograph',
  component: DeviceSurvey,
  meta: { setDone: true }, // optional if this is the last form
})
```

### Withdraw

**Component**: `@/builtins/withdraw/WithdrawView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/withdraw/WithdrawView.vue)  
**Side
effects**: Sets the `consent` key in the `localStorage` to `true.`  
**Typical accessibility**: `{ requiresWithdraw: true }`

As part of most IRB protocols, participants should be able to withdraw from a
study at any time for any reason. Online, this is as simple as closing the
browser window and moving onto something else. However, <SmileText/> provides a
simple and clear way for a participant withdraw at any time from a study, while
also providing feedback about why they are withdrawing.

![Withdraw button](/images/withdraw.png)

When participants click this button (only appears after accepting the informed
consent), then they are presented with a form, including several optional
questions about why they are withdrawing and their contact information (e.g.,
for receiving partial compensation). As a side effect of

When they submit this form, they will be taken to a final page asking them to
return the task/HIT. It is the responsibility of the experimenter to monitor
withdraws and to try to contact the participant if needed for partial
compensation.

```js
// put this at the top of the file
import Withdraw from '@/builtins/withdraw/WithdrawView.vue'

// withdraw
timeline.registerView({
  name: 'withdraw',
  meta: {
    requiresWithdraw: true,
    resetApp: api.getConfig('allowRepeats'),
  },
  component: Withdraw,
})
```

### Debrief

**Component**: `@/builtins/debrief/DebriefView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/debrief/DebriefView.vue)  
**Side
effects**: No  
**Typical accessibility**: Always

The debrief page displays the text that explains the purpose of the experiment
and provides the participant with any additional postfacto information about the
task they just completed. The text can be customized in
`@/user/components/DebriefText.vue`, and this page will transition the user to
their post-experiment surveys.

```js
// put this at the top of the file
import Debrief from '@/builtins/debrief/DebriefView.vue'

// debrief
import DebriefText from '@/user/components/DebriefText.vue' // get access to the global store
timeline.pushSeqView({
  name: 'debrief',
  component: Debrief,
  props: {
    debriefText: markRaw(DebriefText),
  },
})
```

### Thanks

**Component**: `@/builtins/thanks/ThanksView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/thanks/ThanksView.vue)  
**Side
effects**: Yes, saves the data from the form.  
**Typical accessibility**: `{requiresDone: true}`

```js
// put this at the top of the file
import Thanks from '@/builtins/thanks/ThanksView.vue'

// thanks
timeline.pushSeqView({
  name: 'thanks',
  component: Thanks,
  meta: {
    requiresDone: true,
    resetApp: api.getConfig('allowRepeats'),
  },
})
```

### Feedback Survey

**Component**: `src/builtins/task_survey/TaskFeedbackSurveyView.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/task_survey/TaskFeedbackSurveyView.vue)  
**Side
effects**: Yes, saves the data from the form.  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

The task survey asks some simple questions about the participant's experience in
the task. The questions gauge how enjoyable and challenging the task was and
offer a space for the participant to provide general feedback and comments on
issues and improvements.

If you want this to be the last view in the study, you can set the `setDone`
meta field.

```js
// put this at the top of the file
import TaskFeedbackSurvey from '@/builtins/device_survey/TaskFeedbackSurveyView.vue'

// feedback
timeline.pushSeqView({
  name: 'feedback',
  component: TaskFeedbackSurvey,
  meta: { setDone: true }, // optional if this is the last form
})
```

### Report Issue

Coming soon

## Navbars and Modals

In addition to these builtin Views, <SmileText/> also provides a few components
that appear on the main App and are thus visible on every View on the timeline.
These provide information that is useful to participants at any moment in the
task. For example, the Status Bar provides a way for participants to withdraw
from a study at any time, report an issue, look at the informed consent form
again. These components are called "Navbars" and are not arranged on the
Timeline but instead are imported in the top level `App.vue` file.

In addition there are a few modals that are used to collect information from
participants when they are withdrawing from a study or reporting an issue.

All these components are includes in the `@/builtins` directory and you can edit
them as needed for your study.

### Status Bar

**Base Component**: `@/builtins/navbars/StatusBar.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/navbars/StatusBar.vue)

### Progress Bar

**Base Component**: `@/builtins/navbars/ProgressBar.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/navbars/ProgressBar.vue)

Not implemented fully.

### Withdraw Modal

**Base Component**: `@/builtins/withdraw/WithdrawFormModal.vue`  
**Code**: [source](https://github.com/NYUCCL/smile/blob/main/src/builtins/withdraw/WithdrawFormModal)  
**Side
effects**: Yes
