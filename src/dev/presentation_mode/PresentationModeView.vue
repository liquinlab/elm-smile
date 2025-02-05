<script setup>
import { computed } from 'vue'
// setup the info for the page here

// main title
const title = 'This is my default title for a project'
//subtitle
const subtitle = 'This is a subtitle for my project which makes it seem interesting and relevant to a wide audience.'

// access today's date
const lastupdated = __BUILD_TIME__

// site author (who is publishing this or made the present mode site?)
const siteauthor = {
  name: 'Todd Gureckis',
  link: 'https://gureckislab.org',
}

// project authors (who made the project?)
const projectauthors = [
  {
    name: 'Todd Gureckis',
    link: 'https://todd.gureckislab.org',
    affiliation: 'New York University',
  },
  {
    name: 'Guy Davidson',
    link: 'https://guydavidson.me/',
    affiliation: ['New York University', 'Meta AI Labs'],
  },
]

// a list of project info include urls to prprints
// the link field is optional
const info = [
  {
    title: 'DOI',
    data: '10.23915/distill.00032',
    link: 'https://doi.org/10.23915/distill.00032',
  },
  {
    title: 'Project Site',
    data: 'gureckislab.org',
    link: 'https://gureckislab.org',
  },
  {
    title: 'arxiv Preprint',
    data: 'link',
    link: 'https://gureckislab.org',
  },
]

const uniqueAffiliations = computed(() => {
  const affiliations = projectauthors.flatMap((author) =>
    Array.isArray(author.affiliation) ? author.affiliation : [author.affiliation]
  )
  return [...new Set(affiliations)]
})

function getUniqueAffiliations(affiliation) {
  return Array.isArray(affiliation) ? affiliation : [affiliation]
}
function getAffiliationIndex(affiliation) {
  return uniqueAffiliations.value.indexOf(affiliation) + 1
}
</script>

<template>
  <div class="present-body">
    <section class="present-title">
      <div class="body">
        <div class="maintitle">{{ title }}</div>
        <br />
        <div class="subtitle">{{ subtitle }}</div>
      </div>
    </section>
    <section class="present-author">
      <div class="body">
        <div class="columns">
          <div class="column is-6">
            <!-- authors and affiliations list -->
            <div class="columns">
              <div class="column is-5">
                <div class="info-header">Authors</div>
                <div class="info-data" v-for="(author, index) in projectauthors" :key="index">
                  <template v-if="author.link">
                    <a :href="author.link">{{ author.name }}</a>
                  </template>
                  <template v-else>
                    {{ author.name }}
                  </template>
                  <sup>
                    <template v-for="(aff, affIndex) in getUniqueAffiliations(author.affiliation)" :key="affIndex">
                      {{ getAffiliationIndex(aff)
                      }}{{ affIndex < getUniqueAffiliations(author.affiliation).length - 1 ? ',' : '' }}
                    </template>
                  </sup>
                </div>
              </div>
              <div class="column is-7">
                <div class="info-header">Affiliation</div>
                <div class="info-data" v-for="(aff, index) in uniqueAffiliations" :key="index">
                  <sup>{{ index + 1 }}</sup
                  >&nbsp;{{ aff }}
                </div>
              </div>
            </div>
          </div>
          <div class="column is-2">
            <div class="info-header">Last updated</div>
            <div class="info-data">{{ lastupdated }}</div>
          </div>
          <div class="column is-4">
            <template v-for="i in info">
              <div class="info-header">{{ i.title }}</div>
              <div class="info-data">
                <a v-if="i.link" :href="i.link">{{ i.data }}</a>
                <template v-else>{{ i.data }}</template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>
    <div class="content">
      <p class="is-size-6 has-text-left">
        This is a description of this project. It was a project that took many years to set up. The purpose of this site
        is to document the project and to allow people to experience the task first hand. Presentation mode is a nice
        way to share the experiment with the world. In addition you can use presentation mode a simple interface/viewer
        for your task. It's actually pretty fun.
      </p>
      <p class="is-size-6 has-text-left">
        Maybe someday we can make this like a full featured scientific writing tool with support for math equations and
        stuff but for now this is just a starter template with a design inspited by the Distill.pub website.
      </p>
      <p class="is-size-6 has-text-left">
        You can write as much as you want here and then you can include links and other elements from your experiment.
      </p>
      <p class="is-size-6 has-text-left">
        Use the links below to navigate to different parts of the experiment, or use the navigation bar at the top of
        the page.
      </p>
      <hr />
      <h3 class="is-size-5">Start from beginning</h3>
      <p class="is-size-6">
        Start the experiment from the very beginning as if you were a real participant. Your data will not be saved,
        though some local storage may be used while you are on the page.
      </p>
      <a href="#/welcome" class="button is-amber is-small"
        >Start &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </a>
      <hr />
      <h3 class="is-size-5">Instructions</h3>
      <p class="is-size-6">
        Go to the task instructions to learn about how to play the game. After several pages of instructions, you can
        try out the comprehension quiz that real participants must pass to continue.
      </p>
      <a href="#/instructions" class="button is-teal is-small"
        >Instructions &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </a>
      <hr />
      <h3 class="is-size-5">Play captcha game</h3>
      <p class="is-size-6">
        Try out the captcha game participants play to ensure that they are human (and that the required software loads
        properly in their browser).
      </p>
      <a href="#/captcha" class="button is-emerald is-small"
        >Captcha &nbsp;
        <FAIcon icon="fa-solid fa-arrow-right" />
      </a>
    </div>
    <footer class="present-footer">
      <div class="has-text-centered">
        <p>
          Created by <a :href="siteauthor.link">{{ siteauthor.name }}</a> using 🫠
          <a href="https://smile.gureckislab.org">Smile</a>.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.present-body {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.present-footer {
  background-color: var(--dev-bar-mild-grey);
  padding: 20px;
  height: 100px;
  text-align: center;
  font-size: 14px;
}

.present-title {
  background-color: var(--dev-bar-light-grey);
  padding: 0px;
  padding-top: 70px;
  padding-bottom: 40px;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.present-title .body,
.present-author .body {
  padding: 10px;
  width: 65%;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.1;
}

.present-author {
  margin-bottom: 30px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 20px;
  text-align: left;
  border-bottom-color: var(--dev-bar-mild-grey);
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-top-color: var(--dev-bar-mild-grey);
  border-top-width: 1px;
  border-top-style: solid;
  width: 100%;
}

.present-title .maintitle {
  font-size: 50px;
  font-weight: bold;
}

.present-title.subtitle {
  font-size: 20px;
}

.info-header {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 200;
  letter-spacing: 0.05em;
  padding-bottom: 0.8em;
  color: var(--dev-bar-dark-grey);
}

.info-data {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  padding-bottom: 0.8em;
  color: black;
}

.content {
  width: 65%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: auto;
  padding-bottom: 60px;
  text-align: left;
}

.is-pink {
  background-color: #ffc0cb;
}

.is-amber {
  background-color: #fda90b;
  color: #935610;
  border-color: #ea9809;
}

.is-teal {
  background-color: #22afd65c;
  color: #1f8abb;
  border-color: #91c2d1;
}

.is-sky {
  background-color: #0e7de45c;
  color: #1f8abb;
  border-color: #91c2d1;
}

.is-emerald {
  background-color: #0fe7785c;
  color: #0d722d;
  border-color: #1ac444;
}
</style>
