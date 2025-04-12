<script setup>
import { reactive, computed } from 'vue'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
const api = useViewAPI()

const pages = api.spec().append([{ path: 'survey_page1' }, { path: 'survey_page2' }, { path: 'survey_page3' }])
api.addSpec(pages)

// persists the form info in local storage, otherwise initialize
if (!api.globals.forminfo) {
  api.globals.forminfo = reactive({
    dob: '',
    gender: '',
    race: '',
    hispanic: '',
    fluent_english: '',
    normal_vision: '',
    color_blind: '',
    learning_disability: '',
    neurodevelopmental_disorder: '',
    psychiatric_disorder: '',
    country: '',
    zipcode: '',
    education_level: '',
    household_income: '',
  })
}

const page_one_complete = computed(
  () =>
    api.globals.forminfo.dob !== '' &&
    api.globals.forminfo.gender !== '' &&
    api.globals.forminfo.race !== '' &&
    api.globals.forminfo.hispanic !== '' &&
    api.globals.forminfo.fluent_english !== ''
)

const page_two_complete = computed(
  () =>
    api.globals.forminfo.color_blind !== '' &&
    api.globals.forminfo.learning_disability !== '' &&
    api.globals.forminfo.neurodevelopmental_disorder !== '' &&
    api.globals.forminfo.psychiatric_disorder !== ''
)

const page_three_complete = computed(
  () =>
    api.globals.forminfo.country !== '' &&
    api.globals.forminfo.education_level !== '' &&
    api.globals.forminfo.household_income !== ''
)

function autofill() {
  api.globals.forminfo.dob = '1978-09-12'
  api.globals.forminfo.gender = 'Male'
  api.globals.forminfo.race = 'Caucasian/White'
  api.globals.forminfo.hispanic = 'No'
  api.globals.forminfo.fluent_english = 'Yes'
  api.globals.forminfo.normal_vision = 'Yes'
  api.globals.forminfo.color_blind = 'No'
  api.globals.forminfo.learning_disability = 'No'
  api.globals.forminfo.neurodevelopmental_disorder = 'No'
  api.globals.forminfo.psychiatric_disorder = 'No'
  api.globals.forminfo.country = 'United States'
  api.globals.forminfo.zipcode = '12345'
  api.globals.forminfo.education_level = 'Doctorate Degree (PhD/Other)'
  api.globals.forminfo.household_income = '$100,000–$199,999'
}

api.setAutofill(autofill)

function finish() {
  api.recordForm('demographicForm', api.globals.forminfo)
  api.goNextView()
}
</script>

<template>
  <div class="page prevent-select">
    <div class="formcontent">
      <h3 class="is-size-3 has-text-weight-bold"><FAIcon icon="fa-solid fa-person" />&nbsp;Demographic Information</h3>
      <p class="is-size-6">
        We request some information about you which we can use to understand aggregate differences between individuals.
        Your privacy will be maintained and the data will not be linked to your online identity (e.g., email).
      </p>
      <div class="formstep" v-if="api.paths === 'survey_page1'">
        <div class="columns">
          <div class="column is-one-third">
            <div class="formsectionexplainer">
              <h3 class="is-size-6 has-text-weight-bold">Basic Info</h3>
              <p class="is-size-6">First, we need some basic, generic information about you.</p>
            </div>
          </div>
          <div class="column">
            <div class="box is-shadowless formbox">
              <FormKit
                type="date"
                label="Date of Birth"
                placeholder="1/1/1960"
                name="dob"
                v-model="api.globals.forminfo.dob"
                help="Enter your birthday (required)"
                validation="required"
              />
              <FormKit
                type="select"
                label="Gender"
                name="gender"
                help="Enter your self-identified gender (required)"
                placeholder="Select an option"
                :options="['Male', 'Female', 'Other', 'I prefer not to say']"
                v-model="api.globals.forminfo.gender"
              />
              <FormKit
                type="select"
                label="Race"
                name="race"
                v-model="api.globals.forminfo.race"
                help="Enter the race that best describes you (required)"
                placeholder="Select an option"
                :options="[
                  'Asian',
                  'Black/African American',
                  'Caucasian/White',
                  'Native American',
                  'Pacific Islander/Native Hawaiian',
                  'Mixed Race',
                  'Other',
                  'I prefer not to say',
                ]"
              />
              <FormKit
                type="select"
                label="Are you hispanic?"
                name="hispanic"
                v-model="api.globals.forminfo.hispanic"
                placeholder="Select an option"
                help="Do you consider yourself hispanic? (required)"
                validation="required"
                :options="['No', 'Yes', 'I prefer not to say']"
              />
              <FormKit
                type="select"
                label="Are you fluent in English?"
                name="english"
                v-model="api.globals.forminfo.fluent_english"
                help="Are you able to speak and understanding English? (required)"
                placeholder="Select an option"
                validation="required"
                :options="['Yes', 'No', 'I prefer not to say']"
              />
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-right">
                    <button class="button is-warning" id="finish" v-if="page_one_complete" @click="api.goNextStep()">
                      Continue &nbsp;
                      <FAIcon icon="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="formstep" v-else-if="api.paths === 'survey_page2'">
        <div class="columns">
          <div class="column is-one-third">
            <div class="formsectionexplainer">
              <h3 class="is-size-6 has-text-weight-bold">Psychological Information</h3>
              <p class="is-size-6">Next, we need some basic information about your ability to perceive this study.</p>
            </div>
          </div>
          <div class="column">
            <div class="box is-shadowless formbox">
              <FormKit
                type="select"
                name="vision"
                label="Do you have normal vision (or corrected to be normal)?"
                help="Do you have normal vision? (required)"
                placeholder="Select an option"
                validation="required"
                v-model="api.globals.forminfo.normal_vision"
                :options="['Yes', 'No', 'Unsure', 'I prefer not to say']"
              />
              <FormKit
                type="select"
                name="colorblind"
                label="Are you color blind?"
                help="Do you have any color blindness? (required)"
                placeholder="Select an option"
                validation="required"
                v-model="api.globals.forminfo.color_blind"
                :options="['Yes', 'No', 'Unsure', 'I prefer not to say']"
              />
              <FormKit
                type="select"
                name="learningdisability"
                label="Have you been diagnosed with a learning disability (e.g., dyslexia, dysclaculia)?"
                help="Do you have a diagnosed learning disability? (required)"
                placeholder="Select an option"
                validation="required"
                v-model="api.globals.forminfo.learning_disability"
                :options="['Yes', 'No', 'Unsure', 'I prefer not to say']"
              />
              <FormKit
                type="select"
                name="neurodevelopmentaldisorder"
                label="Have you been diagnosed with a neurodevelopmental disorder (e.g., autism, tic disorder)?"
                help="Do you have a diagnosis of a neurodevelopmental disorder? (required)"
                placeholder="Select an option"
                validation="required"
                v-model="api.globals.forminfo.neurodevelopmental_disorder"
                :options="['Yes', 'No', 'Unsure', 'I prefer not to say']"
              />
              <FormKit
                type="select"
                name="psychiatricdisorder"
                label="Have you been diagnosed with a psychiatric disorder (e.g., anxiety, depression, OCD)?"
                help="Do you have diagnosis of a psychiatric disorder? (required)"
                validation="required"
                v-model="api.globals.forminfo.psychiatric_disorder"
                placeholder="Select an option"
                :options="['Yes', 'No', 'Unsure', 'I prefer not to say']"
              />
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-left">
                    <button class="button is-warning" id="finish" @click="api.goPrevStep()">
                      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; Previous
                    </button>
                  </div>
                </div>
                <div class="column">
                  <div class="has-text-right">
                    <button class="button is-warning" id="finish" v-if="page_two_complete" @click="api.goNextStep()">
                      Continue &nbsp;
                      <FAIcon icon="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="formstep" v-else-if="api.paths === 'survey_page3'">
        <div class="columns">
          <div class="column is-one-third">
            <div class="formsectionexplainer">
              <h3 class="is-size-6 has-text-weight-bold">Household Info</h3>
              <p class="is-size-6">Finally we need some basic household information.</p>
            </div>
          </div>
          <div class="column">
            <div class="box is-shadowless formbox">
              <FormKit
                type="select"
                label="Country"
                name="country"
                placeholder="Select an option"
                validation="required"
                v-model="api.globals.forminfo.country"
                help="Select the country in which you reside. (required)"
                :options="[
                  'Afghanistan',
                  'Albania',
                  'Algeria',
                  'Andorra',
                  'Angola',
                  'Antigua & Deps',
                  'Argentina',
                  'Armenia',
                  'Australia',
                  'Austria',
                  'Azerbaijan',
                  'Bahamas',
                  'Bahrain',
                  'Bangladesh',
                  'Barbados',
                  'Belarus',
                  'Belgium',
                  'Belize',
                  'Benin',
                  'Bhutan',
                  'Bolivia',
                  'Bosnia Herzegovina',
                  'Botswana',
                  'Brazil',
                  'Brunei',
                  'Bulgaria',
                  'Burkina',
                  'Burundi',
                  'Cambodia',
                  'Cameroon',
                  'Canada',
                  'Cape Verde',
                  'Central African Rep',
                  'Chad',
                  'Chile',
                  'China',
                  'Colombia',
                  'Comoros',
                  'Congo',
                  'Congo {Democratic Rep}',
                  'Costa Rica',
                  'Croatia',
                  'Cuba',
                  'Cyprus',
                  'Czech Republic',
                  'Denmark',
                  'Djibouti',
                  'Dominica',
                  'Dominican Republic',
                  'East Timor',
                  'Ecuador',
                  'Egypt',
                  'El Salvador',
                  'Equatorial Guinea',
                  'Eritrea',
                  'Estonia',
                  'Ethiopia',
                  'Fiji',
                  'Finland',
                  'France',
                  'Gabon',
                  'Gambia',
                  'Georgia',
                  'Germany',
                  'Ghana',
                  'Greece',
                  'Grenada',
                  'Guatemala',
                  'Guinea',
                  'Guinea-Bissau',
                  'Guyana',
                  'Haiti',
                  'Honduras',
                  'Hungary',
                  'Iceland',
                  'India',
                  'Indonesia',
                  'Iran',
                  'Iraq',
                  'Ireland {Republic}',
                  'Israel',
                  'Italy',
                  'Ivory Coast',
                  'Jamaica',
                  'Japan',
                  'Jordan',
                  'Kazakhstan',
                  'Kenya',
                  'Kiribati',
                  'Korea North',
                  'Korea South',
                  'Kosovo',
                  'Kuwait',
                  'Kyrgyzstan',
                  'Laos',
                  'Latvia',
                  'Lebanon',
                  'Lesotho',
                  'Liberia',
                  'Libya',
                  'Liechtenstein',
                  'Lithuania',
                  'Luxembourg',
                  'Macedonia',
                  'Madagascar',
                  'Malawi',
                  'Malaysia',
                  'Maldives',
                  'Mali',
                  'Malta',
                  'Marshall Islands',
                  'Mauritania',
                  'Mauritius',
                  'Mexico',
                  'Micronesia',
                  'Moldova',
                  'Monaco',
                  'Mongolia',
                  'Montenegro',
                  'Morocco',
                  'Mozambique',
                  'Myanmar, {Burma}',
                  'Namibia',
                  'Nauru',
                  'Nepal',
                  'Netherlands',
                  'New Zealand',
                  'Nicaragua',
                  'Niger',
                  'Nigeria',
                  'Norway',
                  'Oman',
                  'Pakistan',
                  'Palau',
                  'Panama',
                  'Papua New Guinea',
                  'Paraguay',
                  'Peru',
                  'Philippines',
                  'Poland',
                  'Portugal',
                  'Qatar',
                  'Romania',
                  'Russian Federation',
                  'Rwanda',
                  'St Kitts & Nevis',
                  'St Lucia',
                  'Saint Vincent & the Grenadines',
                  'Samoa',
                  'San Marino',
                  'Sao Tome & Principe',
                  'Saudi Arabia',
                  'Senegal',
                  'Serbia',
                  'Seychelles',
                  'Sierra Leone',
                  'Singapore',
                  'Slovakia',
                  'Slovenia',
                  'Solomon Islands',
                  'Somalia',
                  'South Africa',
                  'South Sudan',
                  'Spain',
                  'Sri Lanka',
                  'Sudan',
                  'Suriname',
                  'Swaziland',
                  'Sweden',
                  'Switzerland',
                  'Syria',
                  'Taiwan',
                  'Tajikistan',
                  'Tanzania',
                  'Thailand',
                  'Togo',
                  'Tonga',
                  'Trinidad & Tobago',
                  'Tunisia',
                  'Turkey',
                  'Turkmenistan',
                  'Tuvalu',
                  'Uganda',
                  'Ukraine',
                  'United Arab Emirates',
                  'United Kingdom',
                  'United States',
                  'Uruguay',
                  'Uzbekistan',
                  'Vanuatu',
                  'Vatican City',
                  'Venezuela',
                  'Vietnam',
                  'Yemen',
                  'Zambia',
                  'Zimbabwe',
                ]"
              />
              <FormKit
                type="text"
                name="zipcode"
                label="Zipcode/Postal Code"
                placeholder="Enter zip or postal code"
                validation="optional"
                v-model="api.globals.forminfo.zipcode"
                help="Select zipcode or postal code of your primary residence. (optional)"
              />

              <FormKit
                type="select"
                name="education"
                label="Highest level of education"
                placeholder="Select an option"
                v-model="api.globals.forminfo.education_level"
                help="What is your highest level of schooling that you completed? (required)"
                :options="[
                  'No Formal Qualifications',
                  'Secondary Education (ie. GED/GCSE)',
                  'High School Diploma (A-levels)',
                  'Technical/Community College',
                  'Undergraduate Degree (BA/BS/Other)',
                  'Graduate Degree (MA/MS/MPhil/Other)',
                  'Doctorate Degree (PhD/Other)',
                  'Don’t Know/Not Applicable',
                  'I prefer not to answer',
                ]"
              />
              <FormKit
                type="select"
                name="income"
                label="Enter your approximate household income."
                help="What is your approximate household income? (required)"
                placeholder="Select an option"
                v-model="api.globals.forminfo.household_income"
                :options="[
                  'Less than $20,000',
                  '$20,000–$39,999',
                  '$40,000–$59,999',
                  '$60,000–$79,999',
                  '$80,000–$99,999',
                  '$100,000–$199,999',
                  '$200,000–$299,999',
                  '$300,000–$399,999',
                  '$400,000–$499,999',
                  '$500,000+',
                  'I don’t know',
                  'I prefer not to answer',
                ]"
              />
              <hr />
              <div class="columns">
                <div class="column">
                  <div class="has-text-left">
                    <button class="button is-warning" id="finish" @click="api.goPrevStep()">
                      <FAIcon icon="fa-solid fa-arrow-left" />&nbsp; Previous
                    </button>
                  </div>
                </div>
                <div class="column">
                  <div class="has-text-right">
                    <button class="button is-success" id="finish" v-if="page_three_complete" @click="finish()">
                      That was easy!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="formstep" v-else>
        <article class="message is-danger">
          <div class="message-header">
            <p>Error</p>
            <button class="delete" aria-label="delete"></button>
          </div>
          <div class="message-body">
            Error, you shouldn't have been able to get this far! This happened because the stepper for this route has
            been incremented too many times. There's no problem so long as your code doesn't allow this in live mode.
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style>
.formstep {
  margin-top: 40px;
}

:root {
  --fk-bg-input: #fff;
  --fk-max-width-input: 100%;
}

.formbox {
  border: 1px solid #dfdfdf;
  text-align: left;
  background-color: rgb(248, 248, 248);
}

.formkit-input select {
  background-color: #fff;
}

.formcontent {
  width: 80%;
  margin: auto;
  margin-bottom: 40px;
  padding-bottom: 200px;
  text-align: left;
}

.formsectionexplainer {
  text-align: left;
  color: #777;
}
</style>
