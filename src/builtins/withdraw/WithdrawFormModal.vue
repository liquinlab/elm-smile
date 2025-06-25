<script setup>
import { reactive, onMounted } from 'vue'
// import and initalize smile API
import useAPI from '@/core/composables/useAPI'
import { Button } from '@/uikit/components/ui/button'
// get access to the global store
const emit = defineEmits(['toggleWithdraw', 'submitWithdraw'])
const props = defineProps(['prefillEmail'])

const forminfo = reactive({
  reason_select: '',
  reason_comments: '',
  email: '',
})

function withdraw() {
  api.setWithdrawn(forminfo) // set withdraw data fields
  api.saveData(true) // force a data save
  emit('submit-withdraw')
}
</script>

<template>
  <div class="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
    <div class="mb-4 border-b border-red-200 pb-3">
      <h3 class="text-lg font-semibold text-red-800">Withdraw from study</h3>
    </div>
    <div class="space-y-4">
      <p class="text-left text-sm text-gray-700">
        <strong>
          You are free to withdraw from this study at any time. Withdrawing from the study may affect the total amount
          of your compensation. Please complete the following form to complete your withdraw. We will follow up with you
          about partial compensation. You do not have to answer any particular question but we appreciate understanding
          the reasons for your withdraw.
        </strong>
      </p>

      <div class="space-y-4">
        <FormKit
          v-model="forminfo.reason_select"
          type="checkbox"
          label="Why are you withdrawing from the study? (Optional)"
          :options="[
            'I couldn\'t adjust the size of my browser to make everything visible',
            'This task is too hard.',
            'This task is too time consuming.',
            'This task is boring.',
            'I do not understand what I am supposed to do.',
            'I am uncomfortable answering the questions.',
            'The content of the task is upsetting to me.',
            'I am having technical issues.',
          ]"
          decorator-icon="happy"
          help="Select all that apply."
          validation="required|min:3"
        />
        <FormKit
          v-model="forminfo.reason_comments"
          type="textarea"
          label="Additional comments. (Optional)"
          rows="5"
          placeholder="Enter your comments here."
          help="Please let us know any additional information you would like to share."
        />
        <FormKit
          v-model="props.prefillEmail"
          type="email"
          label="Contact email. (Optional)"
          help="Please enter your email address so we can follow up with you.  This is optional and we otherwise will try to figure out how to reach you.  However, this can help avoid any potential problems.  Feel free to use an anonymized email like your Prolific contact email, Hide my email (Apple), or create a free alias on SimpleLogin.  We will not associate this email with your data nor use it for any purpose other than contacting you to resolve the issue."
          validation="email"
          validation-visibility="live"
          placeholder="participant@gmail.com"
        />
      </div>

      <div class="flex justify-end space-x-3 pt-6">
        <Button variant="outline" @click="$emit('toggleWithdraw')"> Nevermind, take me back to the study! </Button>
        <Button variant="destructive" @click="withdraw()"> Withdraw </Button>
      </div>
    </div>
  </div>
</template>
