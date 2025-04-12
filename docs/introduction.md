---
outline: none
---

# :wave: Welcome to Smile!

The <SmileText/> project is a web-based platform designed to make it easy and
fun to develop rich and interactive online experiments. Unlike tools that cater
to non-programmers, Smile is designed to help reasonably competent programmers
accomplish more in less time.

### Highlighted features:

- Fast and fun front-end interface development with [Vue.js](https://vuejs.org)
  and [Bulma CSS](https://bulma.io). Make complex games, animations, and surveys
  with ease.

- Built-in support for [common experiment elements](/views#built-in-views) like
  consent forms, captchas, instructions, and surveys. Just add your custom
  experiment logic and start collecting data.
- Participant-friendly features include the ability to withdraw from the
  experiment (while providing feedback), incremental data saving, optimized load
  times, ability to resume from where you left off even if reloading the pages,
  and graceful error handling.
  <!-- and a responsive design that works on most/all
  devices.-->
- Developer [mode](/developing) which makes it easier to debug and design
  experiments. Jump quickly between phases and trials in your experiments,
  [autofill forms and generate fake data for testing](/autofill),
  [hot-reload](/developing#hot-module-replacement) the code you are working on
  without restarting the entire experiment, and more!
- Use Vue's
  [declarative programming and reactive data binding](/components#declarative-rendering-and-reactivity)
  to simplify your coding.
- Code writing can be greatly accelerated using AI tools like
  [Cursor](https://www.cursor.com/) because LLMs are trained on extensive
  codebases covering VueJS, Bulma, and other popular web standards used by the
  project.
- Built-in support for multiple [recruitment services](/recruitment) including
  Prolific, MTurk, CloudResearch, and more.
- Secure data storage and retrieval using a flexible, but easy-to-use
  [database](/datastorage) API based on
  [Google Firestore and and Real-time Database ](https://firebase.google.com).
- Automatic and highly reproducible [deployment](/deploying) of the latest code
  to the web using [GitHub Actions](https://github.com/features/actions).
- Automated [testing](/testing) framework including unit tests and end-to-end
  tests using [Cypress.io](https://www.cypress.io/) helps experimenters ensure
  code is reliable and bug-free.
- Integrates with the rest of your research life including
  [Slack notifications](/deploying#notifying-the-slack-bot), automatic
  generation of QR codes for
  [recruitment posters](/deploying#notifying-the-slack-bot) (or for
  [presentations](/presentation#qr-code-download)),
  [anonymized links](/deploying#what-url-do-you-send-participants-to), and more.
- Presentation [mode](/presentation) which provides a beautiful and interactive
  demo website you can share with reviewers and collaborators.
- [Data provenance features](/analysis#data-provenance) include an audit trail
  of which version of the code was used to create each data file.
- Great looking and detailed docs, if we do say so ourselves!

The current development is happening at
[https://github.com/nyuccl/smile](https://github.com/nyuccl/smile).

Ready to get started? Continue [here](/requirements).

Not sure? Let us walk you through an [example](/example).

Need help? Go [here](/help).
