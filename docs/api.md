# Smile API

<SmileText /> provides a common API which is accessed in user
[Views](./views.md) and [Components](./components.md). This API provides a set
of methods and properties which enable things like navigation, state management,
data access, and more.

## Usage

The Smile API is typically accessed through the `useViewAPI` composable, which
extends the base `useAPI` with additional functionality for interacting with the
stepper and handling user input events:

```js
// import and initialize view API (recommended)
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

// or import and initialize base API only
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
```

The `useViewAPI` composable provides all the functionality of `useAPI` plus
additional methods for:

- Stepper control and data management
- Keyboard event handling
- Mouse event handling
- Step data recording

## Stepper Functions

The following functions are available when using `useViewAPI`:

### Navigation

- `goNextStep()`: Advances to the next step in the stepper.
- `goPrevStep()`: Returns to the previous step in the stepper.
- `goToStep(path)`: Navigates to a specific step by path.
- `reset()`: Resets the stepper to its initial state.
- `init()`: Initializes the stepper.

### Data Access

- `stepData`: Returns the current step's data as a reactive proxy.
- `d`: Alias for `stepData`.
- `datapath`: Returns the current data path.
- `stepIndex`: Returns the current step index.
- `paths`: Returns the current paths.
- `path`: Returns the current path.
- `length`: Returns the number of steps (excluding SOS/EOS).
- `nSteps`: Alias for `length`.
- `nrows`: Returns the total number of rows including SOS/EOS.

### Table Management

- `spec()`: Creates a new table specification.
- `addSpec(table, ignoreContent = false)`: Adds a table specification to the
  stepper.

### Timing

- `startTimer(name = 'default')`: Starts a timer with the given name.
- `elapsedTime(name = 'default')`: Returns elapsed time in milliseconds.
- `elapsedTimeInSeconds(name = 'default')`: Returns elapsed time in seconds.
- `elapsedTimeInMinutes(name = 'default')`: Returns elapsed time in minutes.

### Global Variables

- `globals`: Access and modify global variables.
- `clearGlobals()`: Clears all global variables.

### State Management

- `clear()`: Clears the stepper state.
- `stepperData(pathFilter = null)`: Returns data from leaf nodes, optionally
  filtered by path.

### Event Handling

- `onKeyDown`: Handler for key down events.
- `onKeyPressed`: Handler for key press events.
- `onKeyUp`: Handler for key up events.
- `useMouse`: Hook for tracking mouse position and state.
- `useMousePressed`: Hook for tracking mouse button press state.

## Base API Functions

The following functions are available in both `useAPI` and `useViewAPI`:

## Navigation

- `goNextView()`: Advances to the next View in the timeline.
- `goPrevView()`: Returns to the previous View in the timeline.
- `goToView(view, force = true)`: Navigates to a specific View (by name). The
  force parameter temporarily disables navigation guards.
- `hasNextView()`: Checks if there's a next View available.
- `hasPrevView()`: Checks if there's a previous View available.

## State Management

- `resetLocalState()`: Clears all locally stored data, and redirects to the
  landing page.
- `resetApp()`: Resets the entire application state.
- `isResetApp()`: Checks if the app has been reset.
- `resetStore()`: Resets just the store state.
- `setKnown()`: Marks the user as known (has begun the experiment).
- `setDone()`: Marks the experiment as done.
- `setConsented()`: Marks that the user has consented.
- `setWithdrawn(forminfo)`: Marks that the user has withdrawn and saves
  information from withdrawal form.
- `verifyVisibility(value)`: Marks that the user can/can't see the whole
  experiment page.
- `getVerifiedVisibility()`: Retrieves the verified visibility state (true or
  false).
- `setCompletionCode(code)`: Sets the completion code for the experiment to
  `code`.
- `connectDB()`: Ensures the user is known and has consented, setting these
  states if needed.

## Component and Configuration Management

- `setAppComponent(key, value)`: Sets a global component configuration.
- `getAppComponent(key)`: Retrieves a global component configuration.
- `setRuntimeConfig(key, value)`: Sets a runtime configuration option.
- `getConfig(key)`: Retrieves a configuration option (first searches config then
  runtime).
- `getConditionByName(name)`: Retrieves a condition by its name.

## Data and Configuration Access

- `config`: Accesses the configuration.
- `data`: Accesses the data store.
- `private`: Accesses private data store.
- `all_data`: Accesses combined private and data stores.
- `all_config`: Accesses combined local, dev, github and main configs.
- `local`: Accesses local storage.
- `global`: Accesses global settings.
- `dev`: Accesses development-only settings.
- `route`: Accesses the current route.
- `router`: Accesses the router object.
- `urls`: Accesses URL configurations.

## Utility Functions

- `useStepper`: Provides trial stepper functionality.
- `isBrowserTooSmall()`: Checks if the browser window is too small.
- `setAutofill(autofill)`: Sets up view autofill (development mode only).
- `removeAutofill()`: Removes view autofill (development mode only).
- `getRecruitmentService()`: Retrieves the recruitment service information.
- `getStepper(routeName)`: Gets the stepper for a specific route.
- `hasAutofill()`: Checks if autofill is available.
- `autofill()`: Performs autofill.
- `currentRouteName()`: Returns the current route name.
- `currentViewName()`: Returns the current view name.
- `getBrowserFingerprint()`: Retrieves the browser fingerprint.
- `preloadAllImages()`: Preloads all images for the experiment.
- `preloadAllVideos()`: Preloads all videos for the experiment.
- `getPublicUrl(path)`: Returns the public URL for a file.
- `getStaticUrl(path)`: Returns the URL for a user static file in
  `src/user/assets/`.
- `getCoreStaticUrl(path)`: Returns the public URL for a static asset provided
  by the smile library in `src/assets`.

## Randomization Functions

- `randomSeed(seed = uuidv4())`: Sets a new global random seed that will remain
  in use until the next route.
- `randomAssignCondition(conditionObject)`: Randomly assigns a condition based
  on the provided condition object. Supports weighted randomization.
- `shuffle(array)`: Shuffles an array.
- `randomInt(min, max)`: Generates a random integer.
- `sampleWithReplacement(array, sampleSize, weights = undefined)`: Samples items
  from an array with replacement.
- `sampleWithoutReplacement(array, sampleSize)`: Samples items from an array
  without replacement.
- `faker`: Accesses faker distributions for generating random data.

## Logging and Debugging

- `log.debug(...message)`: Logs a debug message.
- `log.log(...message)`: Logs a standard message.
- `log.warn(...message)`: Logs a warning message.
- `log.error(...message)`: Logs an error message.
- `log.success(...message)`: Logs a success message.
- `log.clearPageHistory()`: Clears the page history log.
- `log.addToHistory(...args)`: Adds an entry to the page history log.

## Data Recording and Saving

The following methods are used to record and save data in the experiment. Note
that Firestore has limitations on the types of data it can store directly. When
using these methods, ensure your data objects are Firestore-safe:

- Only primitive types (string, number, boolean, null)
- Arrays of primitive types
- Objects containing only primitive types
- Timestamps
- References to other documents
- GeoPoints

Complex JavaScript objects (like functions, classes, or objects with circular
references) must be converted to Firestore-safe formats before saving.

- `recordForm(name, myFirestoreSafeObject)`: Saves form data for any arbitrarily
  named form (see [DemographicSurvey](views#demographic-survey) for an example).
  The object must be Firestore-safe.
- `recordProperty(name, FirestoreSafeObject)`: Saves a Firestore-safe object at
  the top level of the data object. This does not save the data to the database,
  but it does record it in the local state. The next call to `saveData()` will
  save the data to the database.
- `recordStep()`: Records the current step in the stepper. This does not save
  the data to the database, but it does record it in the local state. The next
  call to `saveData()` will save the data to the database.
- `recordData(myFirestoreSafeObject)`: Records a Firestore-safe object in the
  trials. This does not save the data to the database, but it does record it in
  the local state. The next call to `saveData()` will save the data to the
  database.
- `recordWindowEvent(type, event_data = null)`: Records a window event. The
  event_data must be Firestore-safe if provided.
- `saveData(force)`: Saves the current data to the database (force save if
  specified). All data must be Firestore-safe.
