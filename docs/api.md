# Smile API

<SmileText /> provides a common API which is accessed in user
[Views](./views.md) and [Components](./components.md). This API provides a set
of methods and properties which enable things like navigation, state management,
data access, and more.

## Usage

In order to use the API in a view or component, you can access it via the
smileAPI composable:

```js
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
```

This API provides functionality for running online experiments. Below are the
available methods and their descriptions.

## Navigation

- `stepNextView()`: Advances to the next view in the experiment.
- `stepPrevView()`: Returns to the previous view in the experiment.
- `gotoView(view)`: Navigates to a specific view.
- `goBack()`: Returns to the previous page.
- `hasNextView()`: Checks if there's a next view available.
- `hasPrevView()`: Checks if there's a previous view available.

## State Management

- `resetStore()`: Resets the local store.
- `resetLocalState()`: Resets the local state and redirects to the landing page.
- `setKnown()`: Marks the user as known.
- `setDone()`: Marks the experiment as done.
- `setConsented()`: Marks that the user has consented.
- `setWithdrawn(forminfo)`: Marks that the user has withdrawn and saves form
  information.
- `verifyVisibility(value)`: Sets the verified visibility state.
- `saveForm(name, data)`: Saves form data.
- `getVerifiedVisibility()`: Retrieves the verified visibility state.
- `setCompletionCode(code)`: Sets the completion code for the experiment.

## Data and Configuration Access

- `config`: Accesses the configuration.
- `data`: Accesses the data store.
- `local`: Accesses local storage.
- `global`: Accesses global settings.
- `dev`: Accesses development-only settings.
- `route`: Accesses the current route.
- `router`: Accesses the router object.
- `urls`: Accesses URL configurations.

## Utility Functions

- `faker`: Provides access to faker distributions for generating random data.
- `shuffle`: Shuffles an array.
- `useStepper`: Provides trial stepper functionality.
- `isBrowserTooSmall()`: Checks if the browser window is too small.
- `setPageAutofill(autofill)`: Sets up page autofill (development mode only).
- `removePageAutofill()`: Removes page autofill (development mode only).
- `getRecruitmentService()`: Retrieves the recruitment service information.
- `getPageTracker(routeName)`: Gets the page tracker for a specific route.
- `hasAutofill()`: Checks if autofill is available.
- `autofill()`: Performs autofill.
- `currentRouteName()`: Returns the current route name.
- `getCurrentTrial()`: Gets the current trial information.
- `getBrowserFingerprint()`: Retrieves the browser fingerprint.
- `preloadAllImages()`: Preloads all images for the experiment.

## Logging and Debugging

- `log(...message)`: Logs a message.
- `debug(...message)`: Logs a debug message.
- `warn(...message)`: Logs a warning message.
- `error(...message)`: Logs an error message.

## Data Recording

- `recordWindowEvent(type, event_data = null)`: Records a window event.
- `incrementTrial()`: Increments the trial counter.
- `decrementTrial()`: Decrements the trial counter.
- `resetTrial()`: Resets the trial counter.
- `saveData(force)`: Saves the current data (force save if specified).
- `saveTrialData(data)`: Saves trial-specific data.

## Consent Management

- `completeConsent()`: Completes the consent process, setting the user as known
  and consented.
