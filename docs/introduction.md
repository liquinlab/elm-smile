---
outline: none
---

# Welcome to Smile!

The Smile project is new way to develop rich and interactive online experiments.
Smile prioritizes modularity and reusability. Unlike tools that cater to
non-programmers, Smile is designed to help reasonably competent programmers
accomplish more in less time.

### Highlighted features:

- Fast and fun front-end interface development with [Vue.js](https://vuejs.org),
  [Tailwind CSS](https://tailwindcss.com/), and
  [Shadcn/vue](https://www.shadcn-vue.com/). Make complex games, animations, and
  surveys with ease.
- Custom [API](/api) and [developer mode tools](/coding/developing) which
  provides a novel interface for specifying and debugging interactive
  experiments.
- Built-in support for
  [common experiment elements](/coding/views#built-in-views) like consent forms,
  captchas, instructions, and surveys. Just add your custom experiment logic and
  start collecting data.
- [Basic component library](/styling/uikit) which helps you quickly design and
  [layout](/styling/layouts) elements.
- Participant-friendly features include the ability to withdraw from the
  experiment (while providing feedback), incremental data saving, optimized load
  times, ability to resume from where you left off even if reloading the pages,
  and graceful error handling and a responsive design that works on most/all
  devices.
- Developer [mode](/coding/developing) which makes it easier to debug and design
  experiments. Jump quickly between phases and trials in your experiments,
  [autofill forms and generate fake data for testing](/coding/autofill),
  [hot-reload](/coding/developing#hot-module-replacement) the code you are
  working on without restarting the entire experiment, and more!
- Use Vue's
  [declarative programming and reactive data binding](/coding/components#declarative-rendering-and-reactivity)
  to simplify your coding.
- Code writing can be greatly accelerated using AI tools because LLMs are
  trained on extensive codebases covering Vue, Tailwind, and other popular web
  standards used by the project.
- Built-in support for multiple [recruitment services](/recruit/recruitment)
  including Prolific, MTurk, CloudResearch, and more.
- Secure data storage and retrieval using a flexible, but easy-to-use
  [database](/coding/datastorage) API based on
  [Google Firestore and and Real-time Database ](https://firebase.google.com).
- Automatic and highly reproducible [deployment](/recruit/deploying) of the
  latest code to the web using
  [GitHub Actions](https://github.com/features/actions).
- Automated [testing](/coding/testing) framework including unit tests via
  [vitest](https://vitest.dev/) and end-to-end tests using
  [Cypress.io](https://www.cypress.io/) helps experimenters ensure code is
  reliable and bug-free.
- Integrates with the rest of your research life including
  [Slack notifications](/recruit/deploying#notifying-the-slack-bot), automatic
  generation of QR codes for
  [recruitment posters](/recruit/deploying#notifying-the-slack-bot) (or for
  [presentations](/presentation#qr-code-download)),
  [anonymized links](/recruit/deploying#what-url-do-you-send-participants-to),
  and more.
- Presentation [mode](/presentation) which provides a beautiful and interactive
  demo website you can share with reviewers and collaborators.
- [Data provenance features](/analysis#data-provenance) include an audit trail
  of which version of the code was used to create each data file.
- Great looking and detailed docs, if we do say so ourselves!

The current development is happening at
[https://github.com/nyuccl/smile](https://github.com/nyuccl/smile).

Ready to get started? Continue [here](/requirements).

Not sure? Let us walk you through some [key concepts](/concepts).

Need help? Go [here](/help).
