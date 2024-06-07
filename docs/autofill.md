# :writing_hand: Autofill

When developing and debugging your experiment it is useful to have a way to
"fake" data for various components. This serves two purposes:

- It let you quickly jump ahead to test different parts of the code
- It lets you generate fake, but realistic data for your experiment. This can
  help later to test your data analysis scripts.

In <SmileText/> you can autofill forms and other components with fake data.

## Autofill forms

To autofill a form with fake data we register a function with the [API](/api)
that will be called when the autofill button is clicked. This function should
set the values of the form fields to the desired values. The function is pure
JavaScript and can be as simple or complex as needed. For example in the
[demographic survey View](/views#demographic-survey) we might want to autofill
the form with some common values:

```js
<script setup>
function autofill() {
  forminfo.dob = '1986-09-12'
  forminfo.gender = 'Male'
  forminfo.race = 'Caucasian/White'
  forminfo.hispanic = 'No'
  forminfo.fluent_english = 'Yes'
  forminfo.normal_vision = 'Yes'
  forminfo.color_blind = 'No'
  forminfo.learning_disability = 'No'
  forminfo.neurodevelopmental_disorder = 'No'
  forminfo.psychiatric_disorder = 'No'
  forminfo.country = 'United States'
  forminfo.zipcode = '12345'
  forminfo.education_level = 'Doctorate Degree (PhD/Other)'
  forminfo.household_income = '$100,000–$199,999'
}

api.setPageAutofill(autofill)
</script>
```

In this example the `autofill()` function sets the values of the form fields to
deterministic "standin" values. Then we call `api.setPageAutofill(autofill)` to
register this function as available.

When a View has a autofill function registered a special button will appear in
the [developer tools](/developermode) menu bar that, when clicked, will autofill
the form values using this function.

Critically, if you register an autofill function for a View you are responsible
to remove it. For example, in the `onUnmounted` lifecycle hook or in a function
that you call to `finish()` the component you can call
`api.removePageAutofill()` to remove the autofill function from the developer
tools. **Each components is responsible for registering and removing its own
autofills.**

## Autofill trials

The above works for simple forms but what about more complex components like
multi-trial Views. In this case several trials might need autofill data. In
addition, each trial might have different types of autofil data. For example,
each trial might have a correct/incorrect field (Boolean) and a reaction time
field (Number). In this case we can register a function that will be called for
to autofill the data. This function should return an object with the autofill
data for that trial. For example:

## The Autofill API
