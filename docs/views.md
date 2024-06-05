<script setup>
//import AdvertisementView from '../src/builtins/recruitment/AdvertisementView.vue'
</script>

# :building_construction: Views

In <SmileText />, each major phase of an experiment is associated with its own
[component](/components). In <SmileText/>, we call these "Views" although there
is nothing particularly special about them (they are just ordinary Vue
components). (We will refer to Views using a capital 'V' to distinguish them
from ordinary uses of the word "view.").

Views are a useful way of thinking about these bigger parts or phases of an
experiment. We might have called them "pages", "routes", "sections", "parts", or
"phases." Views tend be to modular and reusable "sections" of an experiment that
you might use in different experiments or different parts of the same
experiment. The sequencing of different Views is controlled by the
[**Timeline**](/timeline) (and more specifically `@/user/design.js`).

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

## Built-in Views

When you [setup](/starting) the default <SmileText /> project you get a number
of built-in Views and their associated sub-components that are useful for most
experiments. These include things like obtaining informed consent, presenting
instructions, CAPTCHAs, etc... This section describes these default built-in
Views and provides an overview of how to customize them for your experiment.

### Side effects

Views sometimes have "side-effects" which are changes to the state of the
overall application as a result of the operation of the view. For example, the
Informed Consent View might present the text of the consent form and ask the
participant if they agree to participate. If they do, then a flag is set by the
API to indicate that the participant has consented. Subsequent Views might check
this flag to verify that the subject has consented.

Programmers call these "side-effects" because the break the apparent modularity
of the View. For example, if your experiment needs to know if the participant
has consented, and you remove the Informed Consent View, then you will need to
add some other way to set the consent flag. This is a side-effect of the
Informed Consent View.

We do not include simply writing data as a side-effect (almost all views are
going to write data). We specifically mean that it changes something that might
affect the logic of the experiment.

In the docs for built-in view we will describe the side-effects of each view.

## Overview of Built-in Views

| Name                                         | Side&nbsp;effect? | Description                                                       |
| -------------------------------------------- | :---------------- | :---------------------------------------------------------------- |
| [Recruitment Ad](#recruitment-advertisement) | No                | Landing page for participants                                     |
| [MTurk Ad](#mturk-recruitment)               | No                |                                                                   |
| [Informed Consent](#informed-consent)        | Yes               | Collects informed consent                                         |
| [CAPTCHA](#the-smile-captcha)                | No                | Fun tasks to verify human/attention                               |
| [Window Sizer](#window-sizer)                | Yes               | Verifies a given area of the screen is visible                    |
| [Simple Instructions](#simple-instructions)  | No                | A simple sequence of pages for instructions                       |
| [Demographic Survey](#demographic-survey)    | No                | A survey which collects some demographic info                     |
| [Device Survey](#device-survey)              | No                | A survey which collects some self-report about computer/device    |
| [Withdraw](#withdraw)                        | Yes               | A survey which processes a subject request to withdraw from study |
| [Debrief](#debrief)                          | No                | A simple text View which describes the purpose of the study       |
| [Thanks Page](#thanks)                       | Yes               | A thank you page                                                  |
| [Report Issue](#report-issue)                | Yes               | A thank you page                                                  |

These components are located in the `src/builtins` directory. In <SmileText/> a
short-hand for the src folder is '@' so for instance '@/builtins' refers to the
`src/builtins` directory.

## Builtins API

### Recruitment Advertisement

**Base Component**: `@/builtins/recruitment/AdvertisementView.vue`  
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/recruitment/AdvertisementView.vue)  
**Side effects**: None  
**Typical accessibility**: `{allowAlways: true}`

Before a participant can begin a study they must first be recruited. The landing
page for your experiment is the Advertisement View. This is the first thing that
participants will see when they visit your experiment. The Advertisement View is
a simple page that contains a title and an invitation to participate. There is a
animated button which will take the participant to the next view in the
timeline.

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

Another `design.js` alternative for coming from services like Prolific:

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

### MTurk Recruitment

**Base Component**: `@/builtins/mturk/MTurkRecruitView.vue`  
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/mturk/MTurkRecruitView.vue)  
**Side effects**: None  
**Typical accessibility**: `{allowAlways: true}`

On the Mechanical Turk, the platform list possible HITs (Human Intelligence
Tasks) and workers can choose to complete them. When browsing the listing
participants see one "advertisement" view of the task in an `iframe`. When
browsing in this listing the assignmentId is set to
`ASSIGNMENT_ID_NOT_AVAILABLE`. If they accept the HIT, then the task begins and
a new window opens with the actual task. At this point a valid assignmentId will
be provided.

This View provides the logic to handle these two versions of the recruitment
text. When the assignmentId is not available the participant sees the
"recruitment" text with some information about the study. When the accept the
hit, then see a new page with a button which will launch the <SmileText/>
experiment in a new browser window.

- There are no side effects, and nothing is recorded.
- The template can be edited to change the text.
- The logo image imports from `@/user/assets/brain.svg`.

```js
// put this at the top of the file
import MTurk from '@/builtins/mturk/MTurkRecruitView.vue'

this.pushView({
  path: '/mturk',
  name: 'mturk',
  component: MTurk,
  meta: { allowAlways: true, requiresConsent: false },
  beforeEnter: (to) => {
    processQuery(to.query, 'mturk')
  },
})
```

### Informed Consent

**Base Component**: `@/builtins/consent/InformedConsentView.vue`  
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/consent/InformedConsentView.vue)  
**Side effects**: Yes, sets the `isConsented` key in the [API](/api) to true.  
**Typical accessibility**: `{requiresConsent: false, requiresDone: false}`

Most studies require some type of informed consent from participants. This is
usually a short piece of text describing the study and the participant's rights
and responsibilities. The Informed Consent View is a simple page that displays
this text and asks the participant to agree to participate. If the participant
agrees, then the Informed Consent View sets a flag in the application state
indicating that the participant has consented.

The text of the informed consent should be updated for each study and placed in
`@/builtins/consent/InformedConsentText.vue`. After a participant accepts the
informed consent (usually the first few steps of study) they will see a button
in the [status bar](#status-bar) that will always be available allowing them to
review the consent form in case they have questions.

```js
// put this at the top of the file
import Consent from '@/builtins/consent/InformedConsentView.vue'

timeline.pushSeqView({
  path: '/consent',
  name: 'consent',
  component: Consent,
  meta: {
    requiresConsent: false,
  },
})
```

### The Smile CAPTCHA

**Base Component**: `@/builtins/captcha/CaptchaView.vue`  
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/captcha/CaptchaView.vue)  
**Side effects**: Yes, saves the data from the tasks.  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

CAPTHCAs (Completely Automated Public Turing test to tell Computers and Humans)
are simple tasks used to verify that the user is a human and not a computer. We
developed a unique CAPTCHA system for <SmileText/> that is fun and engaging for
participants. The Smile CAPTCHA is a series of tasks that are easy for humans
but difficult for computers. The tasks happen quickly in sequence with a timer
requiring fast responses (limiting the ability to send the questions to and AI).
In addition, the set of tasks is diverse and requires language understanding,
intuitive physical reasoning, fine motor control and perception, and object
recognition. In addition, a few of the tasks measures known cognitive phenomena
that people are known to show such as patterns in reaction time.

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
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/window_sizer/WindowSizerView.vue)  
**Side effects**: Yes, sets the is verifiedVisibility key in the [API](/api) to
true.  
**Typical accessibility**: `{requiresConsent: true, requiresDone: false}`

The window sizer is a small component `src/components/pages/WindowSizerView.vue`
that will display a box with a configured size on the screen and asked the
participant to adjust their browser window to that size so everything is
visible. It looks like this:

The size of the box is configured in `env/.env` file using the
`VITE_WINDOWSIZER_REQUEST` configuration option. The default value is `800x600`
which means 800 pixel wide and 600 pixels tall. You can change these values as
needed. In development mode you will need to restart the development server
since environment files are only read once on the loading of the application.

In addition to a View appearing on the Timeline in a particular place, it is
possible to re-trigger this View when the browser detects the user has adjusted
the browser to no longer make the task viewport the requested size. To enable
this behavior set `ITE_WINDOWSIZER_AGRESSIVE = true` in the `env/.env` file.

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

**Component**: `src/components/AdvertisementView.vue`  
**Side effects**: Sets the `consent` key in the `localStorage` to `true.`  
**Typical accessibility**: Always

### Demographic Survey

**Base Component**: `@/builtins/demographic_survey/DemographicSurveyView.vue`  
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/demographic_survey/DemographicSurveyView.vue)  
**Side effects**: Yes, saves the data from the form.  
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
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/device_survey/DeviceSurveyView.vue)  
**Side effects**: Yes, saves the data from the form.  
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

```js
// put this at the top of the file
import DeviceSurvey from '@/builtins/device_survey/DeviceSurveyView.vue'

timeline.pushSeqView({
  path: '/demograph',
  name: 'demograph',
  component: DeviceSurvey,
})
```

### Withdraw

**Component**: `src/components/AdvertisementView.vue`  
**Side effects**: Sets the `consent` key in the `localStorage` to `true.`  
**Typical accessibility**: `{ requiresWithdraw: true }`

As part of most IRB approved protocols participants should be eligible to
withdraw from a study at any time for any reason. Online this is as simple as
closing the browser windows and moving onto something else. However,
<SmileText/> provides a simple way to withdraw at any time from a study.

![Withdraw button](/images/withdraw.png)

When participants click this button (only appears after accepting the informed
consent), then they are presented with a form with several optional questions
about why they are withdrawing and also providing information about partial
compensation. If a participant is eligible for partial compensation depends on
several things specific to each study. When they submit this form they will be
taken to a final page asking them to return the task/hit. It is the
responsibility of the experimenter to monitor withdraws and to try to contact
the participant.

### Debrief

**Component**: `src/components/AdvertisementView.vue`  
**Side effects**: Sets the `consent` key in the `localStorage` to `true.`  
**Typical accessibility**: Always

### Thanks

**Component**: `src/components/AdvertisementView.vue`  
**Side effects**: Sets the `consent` key in the `localStorage` to `true.`  
**Typical accessibility**: Always

### Report Issue

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
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/navbars/StatusBar.vue)

### Progress Bar

**Base Component**: `@/builtins/navbars/ProgressBar.vue`  
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/navbars/ProgressBar.vue)

Not implemented fully.

### Withdraw Modal

**Base Component**: `@/builtins/withdraw/WithdrawFormModal.vue`  
**Code**:
[source](https://github.com/NYUCCL/smile/blob/main/src/builtins/withdraw/WithdrawFormModal)  
**Side effects**: Yes
