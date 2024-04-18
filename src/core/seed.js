// based on: http://www.petecorey.com/blog/2020/01/01/random-seeds-lodash-and-es6-imports/
// you must import seed.js before any other modules in your files

// NOTE: this DOES NOT set the seed. Seed is set in beforeResolve in router.js (before each component)
// this script simply defines an ID number that is used to set seeds throughout the experiment
import { v4 as uuidv4 } from 'uuid'
import { pinia } from '@/core/createpinia'
import useSmileStore from '@/core/stores/smiledata' // get access to the global store

const smilestore = useSmileStore(pinia)

import useSmileAPI from '@/core/composables/smileapi'
const api = useSmileAPI()

function getParameterByName(name, url = window.location.href) {
  const nameClean = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp(`[?&]${nameClean}(=([^&#]*)|&|#|$)`)
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

// has the seed already been set?
const seedSet = smilestore.isSeedSet

// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
const seed = getParameterByName('SEED')

//   if the seed hasn't already been set
if (!seedSet) {
  // either pull the seed from the URL
  if (seed) {
    api.log(`Forcing seed id to ${seed}`)
    smilestore.setSeedID(seed)
  } else {
    // otherwise, generate a random ID
    const participantID = uuidv4() // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    api.log(`Set seed id to ${participantID}`)
    smilestore.setSeedID(participantID)
  }
}
