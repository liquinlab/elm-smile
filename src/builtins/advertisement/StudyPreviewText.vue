<script setup>
import useAPI from '@/core/composables/useAPI'
import appconfig from '@/core/config'
const api = useAPI()
const props = defineProps({
  estimated_time: {
    type: String,
    required: true,
  },
  payrate: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="mx-auto ml-20 mr-20 select-none">
    <div class="flex">
      <div class="flex-1">
        <h1 class="text-3xl font-bold mb-4">Welcome to our study!</h1>
        <p class="text-lg text-left mb-4">
          We are offering a paid research study looking at how people learn and make decisions. In this study you will
          look at various shapes
          <FAIcon icon="shapes" /> and pictures
          <FAIcon icon="image" />
          and make decisions similar to a video game. You may earn points for making good decisions that will convert to
          money
          <FAIcon icon="sack-dollar" />
          that we will pay you at the end of the study ({{ payrate }}). The study should take about
          {{ estimated_time }} of your time. You'll be asked to digitally sign a constent form and (optionally) provide
          some non-identifiable demographic information during the study. Your data will be kept anonymous.
        </p>
        <hr class="border-gray-300 my-4" />
        <p>
          <b>Summary:</b> This study is like a game, is mentally challenging, requires concentration, can only be played
          once, and requires a desktop browser.
        </p>
      </div>
      <div class="w-2/5 pl-10">
        <img src="@/user/assets/brain.svg" width="220" class="mb-4" />
        <article class="border border-gray-300 rounded-lg shadow-lg">
          <div class="bg-gray-100 px-3 py-2 text-xs font-medium border-b border-gray-300 rounded-t-lg">
            <p><FAIcon icon="bahai" />&nbsp;&nbsp;Who are we?</p>
          </div>
          <div class="p-3 text-xs text-left">
            <div v-if="!appconfig.anonymousMode">
              We are the
              <a href="http://gureckislab.org" target="_blank" class="text-green-500 hover:text-green-600"
                >Computation and Cognition Lab</a
              >
              at New York University under the direction to
              <a href="http://todd.gureckislab.org" target="_blank" class="text-green-500 hover:text-green-600"
                >Dr. Todd Gureckis</a
              >. Our lab uses games and other fun tasks to study human intellience. Our research is funded in the public
              interest by the United States
              <a href="https://nsf.gov" target="_new" class="text-green-500 hover:text-green-600"
                >National Science Foundation</a
              >
              among other organizations and non-profit foundations and we publish our work, code, and results for the
              public. We very much appreciate research participants in our studies and have a public
              <a
                href="http://gureckislab.org/research-code-of-ethics.html"
                target="_new"
                class="text-green-500 hover:text-green-600"
                >code of ethics</a
              >
              we strive to uphold in all our studies.
            </div>
            <div v-else>You can try our experiment here.</div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
