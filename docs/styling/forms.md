# Forms and Quizes

Forms are a critical component of many psychological experiments and research
studies. Whether you're collecting demographic information, gathering post-task
feedback, or implementing comprehension checks, forms help researchers capture
structured data from participants. Smile provides a comprehensive set of form
components and patterns that make it easy to build everything from simple
feedback surveys to complex multi-step questionnaires.

## Building a Feedback Survey: TaskFeedbackSurveyView Example

The `TaskFeedbackSurveyView` built-in component demonstrates how to build a
comprehensive feedback form in Smile. This component collects both quantitative
ratings and qualitative feedback about a participant's experience with a task,
representing a common pattern in experimental research where researchers want
both structured and open-ended responses.

### Component Architecture and State Management

The form uses several important Smile components working together. The `Select`
components handle rating scales, `Textarea` components capture open-ended
responses, and the `TitleTwoCol` layout provides an organized presentation that
separates instructions from the actual form fields. The useViewAPI composable
manages data persistence and navigation, ensuring that form data survives page
reloads and integrates with the broader experimental flow.

Form state management in smile-ui follows a persistence-first approach. Rather
than using temporary component state that could be lost, the form data is stored
in the persistent API store from the moment the component initializes:

```javascript
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
    difficulty_rating: '',
    enjoyment_rating: '',
    feedback: '',
    issues: '',
  })
}
```

This approach ensures that if a participant accidentally refreshes the page or
navigates away, their form progress is preserved. The reactive wrapper ensures
that Vue's reactivity system can track changes to the form data and update the
UI accordingly.

### Form Validation and User Experience

The component implements comprehensive form validation using Vue's computed
properties. The validation logic checks that all required fields contain
non-empty values, providing immediate feedback to participants about their
progress through the form:

```javascript
const complete = computed(
  () =>
    api.persist.forminfo.difficulty_rating !== '' &&
    api.persist.forminfo.enjoyment_rating !== '' &&
    api.persist.forminfo.feedback !== '' &&
    api.persist.forminfo.issues !== ''
)
```

This validation pattern serves multiple purposes. It prevents incomplete form
submissions, provides clear visual feedback through the disabled state of the
submit button, and ensures data quality by requiring responses to all questions.
The computed property updates reactively as users fill out the form, so the
submit button becomes enabled as soon as all requirements are met.

### Form Field Implementation

The rating scale implementation uses smile-ui's Select component system, which
provides a consistent dropdown interface with proper accessibility support. Each
rating scale presents a clear range of options with descriptive labels rather
than just numbers:

```vue
<Select v-model="api.persist.forminfo.difficulty_rating">
  <SelectTrigger class="w-full bg-background dark:bg-background text-base">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="0 - Very Easy">0 - Very Easy</SelectItem>
    <SelectItem value="1 - Easy">1 - Easy</SelectItem>
    <!-- ... more options ... -->
  </SelectContent>
</Select>
```

The text area implementation captures open-ended responses with appropriate
sizing and styling. The resize-vertical class allows participants to expand the
text area if they have lengthy responses, while the placeholder text provides
clear guidance about what kind of response is expected:

```vue
<Textarea
  v-model="api.persist.forminfo.feedback"
  placeholder="Please provide general thoughts, reactions, or ideas here."
  class="w-full bg-background dark:bg-background text-base resize-vertical"
  rows="4"
/>
```

### Data Recording and Navigation

When participants complete the form, the finish function handles the submission
process. This function demonstrates smile-ui's approach to data recording, which
separates the act of recording form data from the navigation to the next
experimental phase:

```javascript
function finish() {
  api.recordForm('feedbackForm', api.persist.forminfo)
  api.saveData(true) // force a data save
  api.goNextView()
}
```

The recordForm method tags the form data with a specific identifier, making it
easy to locate this data during analysis. The forced data save ensures that the
form responses are immediately persisted to the backend, preventing any data
loss. Only after the data is safely recorded does the function navigate to the
next view in the experimental sequence.

### Development and Testing Support

The component includes an autofill function that demonstrates smile-ui's support
for development workflows. This function allows developers to quickly test form
submission without manually filling out fields during development:

```javascript
function autofill() {
  api.persist.forminfo.difficulty_rating = '0 - Very Easy'
  api.persist.forminfo.enjoyment_rating = '6 - Very Fun'
  api.persist.forminfo.feedback = 'It was good.'
  api.persist.forminfo.issues = 'Too fun?'
}
api.setAutofill(autofill)
```

This pattern is particularly valuable during iterative development, where
researchers might need to test the experimental flow multiple times. The
autofill function can be triggered during development to bypass manual form
completion while still testing the submission and navigation logic.

## Interactive Quiz Component: InstructionsQuiz

The InstructionsQuiz component represents a more sophisticated form pattern that
goes beyond simple data collection. This component implements interactive
comprehension checks with multiple question types, automatic scoring, and retry
functionality. It's commonly used to ensure participants understand experimental
instructions before beginning the main task.

### Component Design and Configuration

The quiz component demonstrates how smile-ui handles complex, multi-step form
interactions. Unlike simple surveys, this component manages question
randomization, multiple response types, and branching logic based on participant
performance. The component accepts several configuration options that allow
researchers to customize the behavior:

```javascript
const props = defineProps({
  questions: {
    type: Object,
    required: true,
  },
  returnTo: {
    type: String,
    default: 'instructions',
  },
  randomizeQandA: {
    type: Boolean,
    default: true,
  },
})
```

The questions prop contains the quiz content, while the returnTo prop specifies
where participants should go if they fail the quiz. The randomizeQandA prop
controls whether questions and answer choices are shuffled, which helps reduce
order effects that could bias participant responses.

### Question Structure and Randomization

The quiz supports both single-select and multi-select questions, allowing
researchers to test different types of comprehension. Single-select questions
work well for testing recall of specific facts, while multi-select questions can
assess understanding of more complex concepts that have multiple correct
aspects.

The randomization system uses smile-ui's built-in shuffle function with a
consistent random seed, ensuring that while the order varies between
participants, the randomization is reproducible for debugging and analysis:

```javascript
function getRandomizedQuestions() {
  api.randomSeed()
  return props.questions.map((page) => ({
    ...page,
    questions: api.shuffle(
      page.questions.map((q) => ({
        ...q,
        answers: api.shuffle(q.answers),
      }))
    ),
  }))
}
```

This approach randomizes both the order of questions within each page and the
order of answer choices within each question. The nested structure preserves the
logical grouping of questions while still providing the benefits of
randomization.

### Multi-Step Navigation and State Management

The quiz uses smile-ui's stepper system to manage multi-page navigation. The
initialization function sets up the step structure, creating separate sections
for the quiz pages and the feedback pages:

```javascript
function init() {
  const sections = api.steps.append([{ id: 'pages' }, { id: 'feedback' }])
  sections[0].append(qs)
  sections[1].append([{ id: 'success' }, { id: 'retry' }])
}
```

This structure allows the quiz to handle both the question-answering phase and
the result-display phase within the same component. The stepper system manages
navigation between pages while maintaining the state of all responses.

### Question Types and Response Collection

The component handles different question types with appropriate UI components.
Single-select questions use the Select component to provide a dropdown
interface, while multi-select questions use the MultiSelect component to allow
participants to choose multiple options:

```vue
<!-- Single-select questions -->
<Select v-model="api.stepData.questions[index].answer">
  <SelectTrigger class="w-full bg-background dark:bg-background text-base">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem v-for="answer in question.answers" :key="answer" :value="answer">
      {{ answer }}
    </SelectItem>
  </SelectContent>
</Select>

<!-- Multi-select questions -->
<MultiSelect
  :options="question.answers"
  v-model="api.stepData.questions[index].answer"
  variant="success"
  help="Select all that apply"
  size="lg"
/>
```

The choice of component depends on the question type, but both integrate
seamlessly with Vue's v-model system to provide reactive data binding.

### Scoring and Validation Logic

The quiz implements sophisticated scoring logic that handles both single-select
and multi-select questions appropriately. For single-select questions, the
scoring is straightforward comparison, but for multi-select questions, the logic
must verify that the participant selected exactly the right combination of
options:

```javascript
const quizCorrect = computed(() => {
  const allQuestions = api
    .queryStepData('pages*')
    .flatMap((page) => page.questions || [])

  return allQuestions.every((question) => {
    if (Array.isArray(question.correctAnswer)) {
      const selectedAnswers = Array.isArray(question.answer)
        ? question.answer
        : [question.answer]
      return (
        question.correctAnswer.length === selectedAnswers.length &&
        question.correctAnswer.every((answer) =>
          selectedAnswers.includes(answer)
        )
      )
    }
    return question.answer === question.correctAnswer[0]
  })
})
```

This scoring system ensures that participants must demonstrate complete
understanding rather than partial knowledge. For multi-select questions,
selecting only some of the correct answers or selecting incorrect answers along
with correct ones will result in a failed attempt.

### Progress Validation and User Experience

Each quiz page validates completion before allowing progression to the next
page. This validation ensures that participants don't accidentally skip
questions and provides immediate feedback about their progress:

```javascript
const currentPageComplete = computed(() => {
  if (!api.stepData?.questions) return false

  return api.stepData.questions.every((question) => {
    if ('answer' in question) {
      if (question.multiSelect) {
        return Array.isArray(question.answer) && question.answer.length > 0
      }
      return true
    }
    return false
  })
})
```

The validation logic is sensitive to question type, requiring at least one
selection for multi-select questions while accepting any non-empty response for
single-select questions. This approach prevents participants from advancing with
incomplete responses while avoiding overly restrictive validation.

### Result Handling and Retry Logic

The quiz provides different outcomes based on participant performance. When
participants complete all questions, the component evaluates their responses and
directs them to either a success page or a retry page:

```javascript
function submitQuiz() {
  api.recordData({
    phase: 'INSTRUCTIONS_QUIZ',
    questions: api.queryStepData('pages*'),
    persist: api.persist,
  })

  if (quizCorrect.value) {
    api.goToStep('feedback/success')
  } else {
    api.goToStep('feedback/retry')
  }
}
```

The success path congratulates participants and allows them to proceed to the
next experimental phase. The retry path provides feedback about the failure and
returns participants to the instructions for review. This branching logic
ensures that only participants who demonstrate adequate understanding proceed to
the main experimental task.

### Attempt Tracking and Data Recording

The component tracks how many times participants attempt the quiz, which can
provide valuable insights into instruction effectiveness and participant
engagement:

```javascript
if (!api.persist.isDefined('attempts')) {
  api.persist.attempts = 1
}

function returnInstructions() {
  api.goFirstStep()
  api.clear()
  api.persist.attempts = api.persist.attempts + 1
  api.goToView(props.returnTo)
}
```

When participants fail the quiz, the component clears their previous answers to
prevent carryover effects, increments the attempt counter, and returns them to
the instructions. This approach provides a clean slate for each attempt while
maintaining important metadata about participant performance.

## Form Design Principles in smile-ui

Building effective forms in smile-ui requires understanding both the technical
capabilities and the research context. The persistent data approach ensures that
participant responses are never lost, even if technical issues occur during data
collection. The validation patterns provide immediate feedback to participants
while ensuring data quality for researchers.

The component architecture promotes reusability and maintainability. By
separating concerns between data management, validation, and presentation, the
form components can be easily adapted for different research contexts. The
integration with smile-ui's navigation system ensures that forms fit seamlessly
into the broader experimental flow.

These patterns demonstrate how smile-ui bridges the gap between simple survey
tools and sophisticated experimental software, providing the control and
flexibility that research demands while maintaining the ease of use that makes
development efficient.
