<script setup>
import { reactive, computed, ref } from 'vue'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'

// import and initalize smile API
import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
import { Calendar } from '@/uikit/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'
import { cn } from '@/uikit/lib/utils'

const api = useViewAPI()

api.steps.append([{ id: 'survey_page1' }, { id: 'survey_page2' }, { id: 'survey_page3' }])

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const dateValue = ref()

// persists the form info in local storage, otherwise initialize
if (!api.persist.isDefined('forminfo')) {
  api.persist.forminfo = reactive({
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

// Watch for date changes and update the form data
import { watch } from 'vue'
watch(dateValue, (newValue) => {
  if (newValue) {
    const date = newValue.toDate(getLocalTimeZone())
    api.persist.forminfo.dob = date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }
})

const page_one_complete = computed(
  () =>
    api.persist.forminfo.dob !== '' &&
    api.persist.forminfo.gender !== '' &&
    api.persist.forminfo.race !== '' &&
    api.persist.forminfo.hispanic !== '' &&
    api.persist.forminfo.fluent_english !== ''
)

const page_two_complete = computed(
  () =>
    api.persist.forminfo.color_blind !== '' &&
    api.persist.forminfo.learning_disability !== '' &&
    api.persist.forminfo.neurodevelopmental_disorder !== '' &&
    api.persist.forminfo.psychiatric_disorder !== ''
)

const page_three_complete = computed(
  () =>
    api.persist.forminfo.country !== '' &&
    api.persist.forminfo.education_level !== '' &&
    api.persist.forminfo.household_income !== ''
)

function autofill() {
  api.persist.forminfo.dob = '1978-09-12'
  api.persist.forminfo.gender = 'Male'
  api.persist.forminfo.race = 'Caucasian/White'
  api.persist.forminfo.hispanic = 'No'
  api.persist.forminfo.fluent_english = 'Yes'
  api.persist.forminfo.normal_vision = 'Yes'
  api.persist.forminfo.color_blind = 'No'
  api.persist.forminfo.learning_disability = 'No'
  api.persist.forminfo.neurodevelopmental_disorder = 'No'
  api.persist.forminfo.psychiatric_disorder = 'No'
  api.persist.forminfo.country = 'United States'
  api.persist.forminfo.zipcode = '12345'
  api.persist.forminfo.education_level = 'Doctorate Degree (PhD/Other)'
  api.persist.forminfo.household_income = '$100,000–$199,999'
}

api.setAutofill(autofill)

function finish() {
  api.recordForm('demographicForm', api.persist.forminfo)
  api.goNextView()
}
</script>

<template>
  <div class="page select-none">
    <div class="w-4/5 mx-auto mb-10 pb-52 text-left">
      <h3 class="text-2xl font-bold mb-4"><FAIcon icon="fa-solid fa-person" />&nbsp;Demographic Information</h3>
      <p class="text-sm mb-8">
        We request some information about you which we can use to understand aggregate differences between individuals.
        Your privacy will be maintained and the data will not be linked to your online identity (e.g., email).
      </p>

      <div class="mt-10" v-if="api.pathString === 'survey_page1'">
        <div class="flex gap-6">
          <div class="w-1/3">
            <div class="text-left text-gray-600">
              <h3 class="text-sm font-bold mb-2">Basic Info</h3>
              <p class="text-sm">First, we need some basic, generic information about you.</p>
            </div>
          </div>
          <div class="flex-1">
            <div class="border border-gray-300 text-left bg-gray-50 p-6 rounded">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Date of Birth </label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      :class="cn('w-full justify-start text-left font-normal', !dateValue && 'text-muted-foreground')"
                    >
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : 'Pick a date' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar v-model="dateValue" initial-focus />
                  </PopoverContent>
                </Popover>
                <p class="text-xs text-gray-500 mt-1">Enter your birthday (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Gender </label>
                <select
                  v-model="api.persist.forminfo.gender"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Enter your self-identified gender (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Race </label>
                <select
                  v-model="api.persist.forminfo.race"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Asian">Asian</option>
                  <option value="Black/African American">Black/African American</option>
                  <option value="Caucasian/White">Caucasian/White</option>
                  <option value="Native American">Native American</option>
                  <option value="Pacific Islander/Native Hawaiian">Pacific Islander/Native Hawaiian</option>
                  <option value="Mixed Race">Mixed Race</option>
                  <option value="Other">Other</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Enter the race that best describes you (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Are you hispanic? </label>
                <select
                  v-model="api.persist.forminfo.hispanic"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Do you consider yourself hispanic? (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Are you fluent in English? </label>
                <select
                  v-model="api.persist.forminfo.fluent_english"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Are you able to speak and understanding English? (required)</p>
              </div>

              <hr class="border-gray-300 my-6" />

              <div class="flex justify-end">
                <Button variant="outline" v-if="page_one_complete" @click="api.goNextStep()">
                  Continue
                  <FAIcon icon="fa-solid fa-arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10" v-else-if="api.pathString === 'survey_page2'">
        <div class="flex gap-6">
          <div class="w-1/3">
            <div class="text-left text-gray-600">
              <h3 class="text-sm font-bold mb-2">Psychological Information</h3>
              <p class="text-sm">Next, we need some basic information about your ability to perceive this study.</p>
            </div>
          </div>
          <div class="flex-1">
            <div class="border border-gray-300 text-left bg-gray-50 p-6 rounded">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Do you have normal vision (or corrected to be normal)?
                </label>
                <select
                  v-model="api.persist.forminfo.normal_vision"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Do you have normal vision? (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Are you color blind? </label>
                <select
                  v-model="api.persist.forminfo.color_blind"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Do you have any color blindness? (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Have you been diagnosed with a learning disability (e.g., dyslexia, dysclaculia)?
                </label>
                <select
                  v-model="api.persist.forminfo.learning_disability"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Do you have a diagnosed learning disability? (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Have you been diagnosed with a neurodevelopmental disorder (e.g., autism, tic disorder)?
                </label>
                <select
                  v-model="api.persist.forminfo.neurodevelopmental_disorder"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Do you have a diagnosis of a neurodevelopmental disorder? (required)
                </p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Have you been diagnosed with a psychiatric disorder (e.g., anxiety, depression, OCD)?
                </label>
                <select
                  v-model="api.persist.forminfo.psychiatric_disorder"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                  <option value="I prefer not to say">I prefer not to say</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Do you have diagnosis of a psychiatric disorder? (required)</p>
              </div>

              <hr class="border-gray-300 my-6" />

              <div class="flex justify-between">
                <Button variant="outline" @click="api.goPrevStep()">
                  <FAIcon icon="fa-solid fa-arrow-left" />
                  Previous
                </Button>
                <Button variant="outline" v-if="page_two_complete" @click="api.goNextStep()">
                  Continue
                  <FAIcon icon="fa-solid fa-arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10" v-else-if="api.pathString === 'survey_page3'">
        <div class="flex gap-6">
          <div class="w-1/3">
            <div class="text-left text-gray-600">
              <h3 class="text-sm font-bold mb-2">Household Info</h3>
              <p class="text-sm">Finally we need some basic household information.</p>
            </div>
          </div>
          <div class="flex-1">
            <div class="border border-gray-300 text-left bg-gray-50 p-6 rounded">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Country </label>
                <select
                  v-model="api.persist.forminfo.country"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="Albania">Albania</option>
                  <option value="Algeria">Algeria</option>
                  <option value="Andorra">Andorra</option>
                  <option value="Angola">Angola</option>
                  <option value="Antigua & Deps">Antigua & Deps</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Armenia">Armenia</option>
                  <option value="Australia">Australia</option>
                  <option value="Austria">Austria</option>
                  <option value="Azerbaijan">Azerbaijan</option>
                  <option value="Bahamas">Bahamas</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Barbados">Barbados</option>
                  <option value="Belarus">Belarus</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Belize">Belize</option>
                  <option value="Benin">Benin</option>
                  <option value="Bhutan">Bhutan</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Bosnia Herzegovina">Bosnia Herzegovina</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Brunei">Brunei</option>
                  <option value="Bulgaria">Bulgaria</option>
                  <option value="Burkina">Burkina</option>
                  <option value="Burundi">Burundi</option>
                  <option value="Cambodia">Cambodia</option>
                  <option value="Cameroon">Cameroon</option>
                  <option value="Canada">Canada</option>
                  <option value="Cape Verde">Cape Verde</option>
                  <option value="Central African Rep">Central African Rep</option>
                  <option value="Chad">Chad</option>
                  <option value="Chile">Chile</option>
                  <option value="China">China</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Comoros">Comoros</option>
                  <option value="Congo">Congo</option>
                  <option value="Congo {Democratic Rep}">Congo {Democratic Rep}</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Croatia">Croatia</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Cyprus">Cyprus</option>
                  <option value="Czech Republic">Czech Republic</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Djibouti">Djibouti</option>
                  <option value="Dominica">Dominica</option>
                  <option value="Dominican Republic">Dominican Republic</option>
                  <option value="East Timor">East Timor</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Egypt">Egypt</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Equatorial Guinea">Equatorial Guinea</option>
                  <option value="Eritrea">Eritrea</option>
                  <option value="Estonia">Estonia</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Fiji">Fiji</option>
                  <option value="Finland">Finland</option>
                  <option value="France">France</option>
                  <option value="Gabon">Gabon</option>
                  <option value="Gambia">Gambia</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Germany">Germany</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Greece">Greece</option>
                  <option value="Grenada">Grenada</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Guinea">Guinea</option>
                  <option value="Guinea-Bissau">Guinea-Bissau</option>
                  <option value="Guyana">Guyana</option>
                  <option value="Haiti">Haiti</option>
                  <option value="Honduras">Honduras</option>
                  <option value="Hungary">Hungary</option>
                  <option value="Iceland">Iceland</option>
                  <option value="India">India</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Iran">Iran</option>
                  <option value="Iraq">Iraq</option>
                  <option value="Ireland {Republic}">Ireland {Republic}</option>
                  <option value="Israel">Israel</option>
                  <option value="Italy">Italy</option>
                  <option value="Ivory Coast">Ivory Coast</option>
                  <option value="Jamaica">Jamaica</option>
                  <option value="Japan">Japan</option>
                  <option value="Jordan">Jordan</option>
                  <option value="Kazakhstan">Kazakhstan</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Kiribati">Kiribati</option>
                  <option value="Korea North">Korea North</option>
                  <option value="Korea South">Korea South</option>
                  <option value="Kosovo">Kosovo</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="Kyrgyzstan">Kyrgyzstan</option>
                  <option value="Laos">Laos</option>
                  <option value="Latvia">Latvia</option>
                  <option value="Lebanon">Lebanon</option>
                  <option value="Lesotho">Lesotho</option>
                  <option value="Liberia">Liberia</option>
                  <option value="Libya">Libya</option>
                  <option value="Liechtenstein">Liechtenstein</option>
                  <option value="Lithuania">Lithuania</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Macedonia">Macedonia</option>
                  <option value="Madagascar">Madagascar</option>
                  <option value="Malawi">Malawi</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Maldives">Maldives</option>
                  <option value="Mali">Mali</option>
                  <option value="Malta">Malta</option>
                  <option value="Marshall Islands">Marshall Islands</option>
                  <option value="Mauritania">Mauritania</option>
                  <option value="Mauritius">Mauritius</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Micronesia">Micronesia</option>
                  <option value="Moldova">Moldova</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Mongolia">Mongolia</option>
                  <option value="Montenegro">Montenegro</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Myanmar, {Burma}">Myanmar, {Burma}</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Nauru">Nauru</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Niger">Niger</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Norway">Norway</option>
                  <option value="Oman">Oman</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Palau">Palau</option>
                  <option value="Panama">Panama</option>
                  <option value="Papua New Guinea">Papua New Guinea</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Peru">Peru</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Poland">Poland</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Romania">Romania</option>
                  <option value="Russian Federation">Russian Federation</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="St Kitts & Nevis">St Kitts & Nevis</option>
                  <option value="St Lucia">St Lucia</option>
                  <option value="Saint Vincent & the Grenadines">Saint Vincent & the Grenadines</option>
                  <option value="Samoa">Samoa</option>
                  <option value="San Marino">San Marino</option>
                  <option value="Sao Tome & Principe">Sao Tome & Principe</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Serbia">Serbia</option>
                  <option value="Seychelles">Seychelles</option>
                  <option value="Sierra Leone">Sierra Leone</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Slovakia">Slovakia</option>
                  <option value="Slovenia">Slovenia</option>
                  <option value="Solomon Islands">Solomon Islands</option>
                  <option value="Somalia">Somalia</option>
                  <option value="South Africa">South Africa</option>
                  <option value="South Sudan">South Sudan</option>
                  <option value="Spain">Spain</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Sudan">Sudan</option>
                  <option value="Suriname">Suriname</option>
                  <option value="Swaziland">Swaziland</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Syria">Syria</option>
                  <option value="Taiwan">Taiwan</option>
                  <option value="Tajikistan">Tajikistan</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Togo">Togo</option>
                  <option value="Tonga">Tonga</option>
                  <option value="Trinidad & Tobago">Trinidad & Tobago</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Turkey">Turkey</option>
                  <option value="Turkmenistan">Turkmenistan</option>
                  <option value="Tuvalu">Tuvalu</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Ukraine">Ukraine</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Uzbekistan">Uzbekistan</option>
                  <option value="Vanuatu">Vanuatu</option>
                  <option value="Vatican City">Vatican City</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Yemen">Yemen</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Select the country in which you reside. (required)</p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Zipcode/Postal Code </label>
                <input
                  type="text"
                  v-model="api.persist.forminfo.zipcode"
                  placeholder="Enter zip or postal code"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Select zipcode or postal code of your primary residence. (optional)
                </p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Highest level of education </label>
                <select
                  v-model="api.persist.forminfo.education_level"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="No Formal Qualifications">No Formal Qualifications</option>
                  <option value="Secondary Education (ie. GED/GCSE)">Secondary Education (ie. GED/GCSE)</option>
                  <option value="High School Diploma (A-levels)">High School Diploma (A-levels)</option>
                  <option value="Technical/Community College">Technical/Community College</option>
                  <option value="Undergraduate Degree (BA/BS/Other)">Undergraduate Degree (BA/BS/Other)</option>
                  <option value="Graduate Degree (MA/MS/MPhil/Other)">Graduate Degree (MA/MS/MPhil/Other)</option>
                  <option value="Doctorate Degree (PhD/Other)">Doctorate Degree (PhD/Other)</option>
                  <option value="Don't Know/Not Applicable">Don't Know/Not Applicable</option>
                  <option value="I prefer not to answer">I prefer not to answer</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  What is your highest level of schooling that you completed? (required)
                </p>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Enter your approximate household income.
                </label>
                <select
                  v-model="api.persist.forminfo.household_income"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="Less than $20,000">Less than $20,000</option>
                  <option value="$20,000–$39,999">$20,000–$39,999</option>
                  <option value="$40,000–$59,999">$40,000–$59,999</option>
                  <option value="$60,000–$79,999">$60,000–$79,999</option>
                  <option value="$80,000–$99,999">$80,000–$99,999</option>
                  <option value="$100,000–$199,999">$100,000–$199,999</option>
                  <option value="$200,000–$299,999">$200,000–$299,999</option>
                  <option value="$300,000–$399,999">$300,000–$399,999</option>
                  <option value="$400,000–$499,999">$400,000–$499,999</option>
                  <option value="$500,000+">$500,000+</option>
                  <option value="I don't know">I don't know</option>
                  <option value="I prefer not to answer">I prefer not to answer</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">What is your approximate household income? (required)</p>
              </div>

              <hr class="border-gray-300 my-6" />

              <div class="flex justify-between">
                <Button variant="outline" @click="api.goPrevStep()">
                  <FAIcon icon="fa-solid fa-arrow-left" />
                  Previous
                </Button>
                <Button variant="default" v-if="page_three_complete" @click="finish()"> That was easy! </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.formstep {
  margin-top: 40px;
}

.formkit-input {
  --fk-bg-input: #fff;
  --fk-max-width-input: 100%;
}

.formkit-wrapper {
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
