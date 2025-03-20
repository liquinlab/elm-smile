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

- `goNextView()`: Advances to the next View in the timeline.
- `goPrevView()`: Returns to the previous View in the timeline.
- `goToView(view)`: Navigates to a specific View (by name).
- `hasNextView()`: Checks if there's a next View available.
- `hasPrevView()`: Checks if there's a previous View available.

## State Management

- `resetLocalState()`: Clears all locally stored data, and redirects to the
  landing page.
- `setKnown()`: Marks the user as known (has begun the experiment).
- `setDone()`: Marks the experiment as done.
- `setConsented()`: Marks that the user has consented.
- `setWithdrawn(forminfo)`: Marks that the user has withdrawn and saves
  information from withdrawal form.
- `verifyVisibility(value)`: Marks that the user can/can't see the whole
  experiment page (see [WindowSizer](views#window-sizer)).
- `getVerifiedVisibility()`: Retrieves the verified visibility state (true or
  false).
- `setCompletionCode(code)`: Sets the completion code for the experiment to
  `code`.
- `resetApp()`: Resets the entire application state.
- `isResetApp()`: Checks if the app has been reset.

## Name this section

- `setAppComponent(key, value)`: Sets a global component configuration.
- `getAppComponent(key)`: Retrieves a global component configuration.
- `setRuntimeConfig(key, value)`: Sets a runtime configuration option.
- `getConfig(key)`: Retrieves a configuration option (first searches config then
  runtime)
- `getConditionByName(name)`: Retrieves a condition by its name.

## Data and Configuration Access

- `config`: Accesses the configuration.
- `data`: Accesses the data store.
- `private`: Accesses private data store.
- `all_data`: Accesses combined private and data stores.
- `local`: Accesses local storage.
- `global`: Accesses global settings.
- `dev`: Accesses development-only settings.
- `route`: Accesses the current route.
- `router`: Accesses the router object.
- `urls`: Accesses URL configurations.

## Utility Functions

- `useStepper`: Provides trial stepper functionality.
- `isBrowserTooSmall()`: Checks if the browser window is too small.
- `setPageAutofill(autofill)`: Sets up page autofill (development mode only).
- `removePageAutofill()`: Removes page autofill (development mode only).
- `getRecruitmentService()`: Retrieves the recruitment service information.
- `getPageTracker(routeName)`: Gets the page tracker for a specific route.
- `hasAutofill()`: Checks if autofill is available.
- `autofill()`: Performs autofill.
- `currentRouteName()`: Returns the current route name.
- `getBrowserFingerprint()`: Retrieves the browser fingerprint.
- `preloadAllImages()`: Preloads all images for the experiment.
- `getPublicUrl(path)`: Returns the public URL for a file. See
  [Images and Video](/imagesvideo#referring-to-static-assets-using-code) for
  more information.
- `getStaticUrl(path)`: Returns the URL for a user static file in
  `src/user/assets/`. See
  [Images and Video](/imagesvideo#referring-to-static-assets-using-code) for
  more information.
- `getCoreStaticUrl(path)`: Returns the public URL for a static asset provided
  by the smile library in `src/assets`. See
  [Images and Video](/imagesvideo#referring-to-static-assets-using-code) for
  more information.

## Randomization Functions

- `randomSeed(seed)`: Sets a new global random seed that will remain in use
  until the next route.
- `randomAssignCondition(conditionObject)`: Randomly assigns a condition based
  on the provided condition object. Supports weighted randomization.
- `shuffle`: Shuffles an array.
- `randomInt()`: Generates a random integer.
- `sampleWithReplacement()`: Samples items from an array with replacement.
- `sampleWithoutReplacement()`: Samples items from an array without replacement.
- `faker`: Accesses faker distributions for generating random data.

## Logging and Debugging

- `log(...message)`: Logs a message.
- `debug(...message)`: Logs a debug message.
- `warn(...message)`: Logs a warning message.
- `error(...message)`: Logs an error message.

## Data Recording

- `createDBRecord()`: Creates a record in the Firestore database for the
  participant.
- `recordWindowEvent(type, event_data = null)`: Records a window event.
- `incrementTrial()`: Increments the trial counter.
- `decrementTrial()`: Decrements the trial counter.
- `resetTrial()`: Resets the trial counter.
- `saveData(force)`: Saves the current data (force save if specified).
- `saveForm(name, data)`: Saves form data for any arbitrarily named form (see
  [DemographicSurvey](views#demographic-survey) for an example).
- `recordTrialData(data)`: Records trial-specific data. This does not save the
  data to the database, but it does record it in the local state. The next call
  to `saveData()` will save the data to the database.
