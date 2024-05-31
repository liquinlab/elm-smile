# :bricks: Built-in Components

```
.
├── LICENSE
├── README.md
├── css
│   ├── main.css
│   └── styles.css
├── data
├── docs
├── env
├── index.html            <-- main html page
├── package-lock.json
├── package.json
├── public
│   └── favicon.ico
├── sass
│   └── mystyles.scss
├── scripts
├── src
│   ├── App.vue
│   ├── assets
│   ├── components/
│   ├── composables/
│   ├── config.js        <-- configuration object
│   ├── icons.js
│   ├── main.js          <-- javascript execution starts here
│   ├── router.js        <-- configure timeline here
│   ├── seed.js
│   ├── stores
│   ├── timeline.js
│   └── utils.js
├── tests
│   ├── cypress
│   ├── cypress.config.js
│   └── vitest
└── vite.config.js
```

## Captcha

Very fast tasks, requiring human common sense, that are diverse, unpredictable,
and have a large number of incorrect responses.

- view everyday photos and answer common sense reasoning question sby clicking
  on the image in a location (e.g., picture of two people one laughing and say
  "click on the happy one")

100 images an interesting image -- click on the with masks that are appropriate

- show an image and record where you click on it

- move an object in a physics/phaser game to achieve something

- normal distorted text (type the word that you can see)

- move a slider slowly so that it doesn't wake up a bear (too fast == wake up,
  beat clock on time)

- watch a crazy video and type the words it says

## Informed Consent

The text of the informed consent should be updated for each study and placed in
`src/components/consent/InformedConsentText.vue`. After participants accept the
informed consent (usually the first few steps of study) they will see a button
that will always be available allowing them to re-review the consent form in
case they have questions.

## Withdraw

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

## WindowSizerPage

The window sizer is a small component `src/components/pages/WindowSizerPage.vue`
that will display a box with a configured size on the screen and asked the
participant to adjust their browser window to that size so everything is
visible. It looks like this:

![Window Sizer](/images/windowsizer.png)

The size of the box is configured in `env/.env` file using the
`VITE_WINDOWSIZER_REQUEST` configuration option. The default value is `800x600`
which means 800 pixel wide and 600 pixels tall. You can change these values as
needed. In development mode you will need to restart the development server
since environment files are only read once on the loading of the application.

To add it to the timeline just add this in the appropriate place inside
`src/router.js`;

```js
// windowsizer
timeline.pushSeqRoute({
  path: '/windowsizer',
  name: 'windowsizer',
  component: WindowSizer,
})
```

## Component organization in Smile

When you start developing your own components there are a few guidelines. First,
components should be named using Pascal Case names (e.g., `StatusBar.vue` or
`InformedConsentButton.vue` as opposed to `statusbar.vue` (lowercase),
`statusBar.vue` (camel case) or `status-bar.vue` (kebab case)). This is the
official recommendation of the
[Vue documentation](https://vuejs.org/guide/components/registration.html#component-name-casing).

Second, components should be organized into folders based on the type of role
the component plays. For this, <SmileText /> borrows sensibly from the
organization of a typical experiment in psychology. In <SmileText />, the
components are organized in the `src/components` directly which has the
following layout:

```
src/components
├── captcha
│   ├── CaptchaInstructionsText.vue
│   ├── CaptchaPage.vue
│   ├── CaptchaTrialImageCategorization.vue
│   ├── CaptchaTrialMotorControl.vue
│   ├── CaptchaTrialStroop.vue
│   └── CaptchaTrialTextComprehension.vue
├── consent
│   ├── ConsentPage.vue
│   ├── InformedConsentModal.vue
│   └── InformedConsentText.vue
├── debrief
│   ├── DebriefPage.vue
│   └── DebriefText.vue
├── errors_withdraw
│   ├── ReportIssueModal.vue
│   ├── WithdrawFormModal.vue
│   └── WithdrawPage.vue
├── instructions
│   └── InstructionsPage.vue
├── navbars
│   ├── DeveloperNavBar.vue
│   ├── PresentationNavBar.vue
│   ├── ProgressBar.vue
│   └── StatusBar.vue
├── presentation_mode
│   └── PresentationModeHomePage.vue
├── recruitment
│   ├── AdvertisementPage.vue
│   ├── MTurkRecruitPage.vue
│   ├── RecruitmentChooserPage.vue
│   └── StudyPreviewText.vue
├── screen_adjust
│   └── WindowSizerPage.vue
├── surveys
│   └── DemographicSurveyPage.vue
├── tasks
│   ├── ExpPage.vue
│   ├── Task1Page.vue
│   └── Task2Page.vue
└── thanks
    └── ThanksPage.vue
```

The following sections describe which types of components go in each folder.
Based on what type of component you are developing, place the corresponding
component file in the correct folder. This will help you stay organized and help
other users of your code know where to look to find an element they might like
to reuse in their projects.

### Captcha

### Consent

### Debrief

### Errors

### Instructions

### Navbars

### Presentation mode

### Recruitment

### Screen adjust

### Surveys

### Tasks

### Thanks

## Component organization in Smile

When you start developing your own components there are a few guidelines. First,
components should be named using Pascal Case names (e.g., `StatusBar.vue` or
`InformedConsentButton.vue` as opposed to `statusbar.vue` (lowercase),
`statusBar.vue` (camel case) or `status-bar.vue` (kebab case)). This is the
official recommendation of the
[Vue documentation](https://vuejs.org/guide/components/registration.html#component-name-casing).

Second, components should be organized into folders based on the type of role
the component plays. For this, <SmileText /> borrows sensibly from the
organization of a typical experiment in psychology. In <SmileText />, the
components are organized in the `src/components` directly which has the
following layout:

```
src/components
├── captcha
│   ├── CaptchaInstructionsText.vue
│   ├── CaptchaPage.vue
│   ├── CaptchaTrialImageCategorization.vue
│   ├── CaptchaTrialMotorControl.vue
│   ├── CaptchaTrialStroop.vue
│   └── CaptchaTrialTextComprehension.vue
├── consent
│   ├── ConsentPage.vue
│   ├── InformedConsentModal.vue
│   └── InformedConsentText.vue
├── debrief
│   ├── DebriefPage.vue
│   └── DebriefText.vue
├── errors_withdraw
│   ├── ReportIssueModal.vue
│   ├── WithdrawFormModal.vue
│   └── WithdrawPage.vue
├── instructions
│   └── InstructionsPage.vue
├── navbars
│   ├── DeveloperNavBar.vue
│   ├── PresentationNavBar.vue
│   ├── ProgressBar.vue
│   └── StatusBar.vue
├── presentation_mode
│   └── PresentationModeHomePage.vue
├── recruitment
│   ├── AdvertisementPage.vue
│   ├── MTurkRecruitPage.vue
│   ├── RecruitmentChooserPage.vue
│   └── StudyPreviewText.vue
├── screen_adjust
│   └── WindowSizerPage.vue
├── surveys
│   └── DemographicSurveyPage.vue
├── tasks
│   ├── ExpPage.vue
│   ├── Task1Page.vue
│   └── Task2Page.vue
└── thanks
    └── ThanksPage.vue
```

The following sections describe which types of components go in each folder.
Based on what type of component you are developing, place the corresponding
component file in the correct folder. This will help you stay organized and help
other users of your code know where to look to find an element they might like
to reuse in their projects.

### Captcha

### Consent

### Debrief

### Errors

### Instructions

### Navbars

### Presentation mode

### Recruitment

### Screen adjust

### Surveys

### Tasks

### Thanks
