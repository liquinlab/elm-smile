import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  runTransaction,
  connectFirestoreEmulator,
  getAggregateFromServer,
  writeBatch,
  increment,
  sum,
} from 'firebase/firestore'
import { split } from 'lodash'
import appconfig from '@/core/config'
import useLog from '@/core/stores/log'
// initialize firebase connection
// since this is a module these will run once at the start

const firebaseApp = initializeApp(appconfig.firebaseConfig)
const auth = getAuth(firebaseApp)
let db

if (appconfig.mode === 'testing') {
  db = getFirestore()
  db._setSettings({ ignoreUndefinedProperties: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  console.warn('WARNING: using local firestore emulator')
} else {
  db = getFirestore(firebaseApp)
  db._setSettings({ ignoreUndefinedProperties: true })
}

let mode = 'real'
if (appconfig.mode === 'development' || appconfig.mode === 'testing') {
  mode = 'testing'
}

export const fsnow = () => Timestamp.now()

// handle anonymous authentication
export const anonymousAuth = async () => {
  const log = useLog()
  try {
    const userCredential = await signInAnonymously(auth)
    log.log('FIRESTORE-DB: Anonymous auth successful')
    return userCredential.user
  } catch (error) {
    log.error('FIRESTORE-DB: Error in anonymous authentication:', error)
    return null
  }
}

// create a collection
export const updateSubjectDataRecord = async (data, docid) => {
  const log = useLog()
  // is it weird to have a aync method that doesn't return anything?
  try {
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/`, docid)
    setDoc(docRef, data, {
      merge: true,
    })
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating document', e)
  }
}

export const updatePrivateSubjectDataRecord = async (data, docid) => {
  const log = useLog()
  // is it weird to have a aync method that doesn't return anything?
  try {
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/${docid}/private/`, 'private_data')
    setDoc(docRef, data, {
      merge: true,
    })
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating document', e)
  }
}

export const loadDoc = async (docid) => {
  const log = useLog()

  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/`, docid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      // console.log('Document data:', data)
      if (data.userUID === user.uid) {
        return data
      } else {
        log.error('FIRESTORE-DB: User does not have access to this document')
        return undefined
      }
    }
    log.error('FIRESTORE-DB: No such document!')
    return undefined
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating document', e)
    return undefined
  }
  // doc.data() will be undefined in this case
  log.error('FIRESTORE-DB: No such document!')
  return undefined
}

export const createDoc = async (data) => {
  const log = useLog()
  log.log(`FIRESTORE-DB: trying to create a main document.`)
  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    const expRef = doc(db, mode, appconfig.project_ref)
    await setDoc(
      expRef,
      {
        project_name: appconfig.project_name,
        project_ref: appconfig.project_ref,
        code_name: appconfig.code_name,
        code_name_url: appconfig.code_name_url,
      },
      { merge: true }
    )
    console.log('FIRESTORE-DB: Document written with ID: ', `${mode}/${appconfig.project_ref}`)

    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, `${mode}/${appconfig.project_ref}/data`), {
      ...data,
      userUID: user.uid,
    })

    data.userUID = user.uid
    log.log(`FIRESTORE-DB: Document written with ID: ${docRef.id} for user ${user.uid})`)
    return docRef.id
  } catch (e) {
    log.error('FIRESTORE-DB: Error adding document: ', e)
    return null
  }
}

export const createPrivateDoc = async (data, docId) => {
  const log = useLog()
  log.log(`FIRESTORE-DB: trying to create a private document in ${docId}`)
  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    // Add a new document with a generated id.
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/${docId}/private/`, 'private_data')
    await setDoc(docRef, {
      ...data,
      userUID: user.uid,
    })
    log.log(`FIRESTORE-DB: Private document written with ID: `, docRef.id)
    return docRef.id
  } catch (e) {
    log.error('FIRESTORE-DB: Error adding private document: ', e)
    return null
  }
}

export const balancedAssignConditions = async (conditionDict, currentConditions) => {
  const log = useLog()
  const num_shards = 20

  // if there are current conditions and we're in developer mode, we won't assign new ones
  if (Object.keys(currentConditions).length !== 0 && appconfig.mode === 'development') {
    log.log('FIRESTORE-DB: conditions already set, not assigning new ones in dev mode')
    return currentConditions
  }

  // if the conditionDict is empty, we'll just return an empty list
  if (Object.keys(conditionDict).length === 0) {
    log.log('FIRESTORE-DB: no conditions to assign')
    return {}
  }

  // function for all possible combinations of N arrays (from https://stackoverflow.com/questions/8936610/how-can-i-create-every-combination-possible-for-the-contents-of-two-arrays)
  const combine = ([head, ...[headTail, ...tailTail]]) => {
    if (!headTail) return head
    const combined = headTail.reduce((acc, x) => acc.concat(head.map((h) => `${h}--${x}`)), [])
    return combine([combined, ...tailTail])
  }

  // Append between-subjects conditions
  const conditionCombos = combine(Object.values(conditionDict))

  // get a docRef for the conditions counter
  const docRef = doc(db, `${mode}/${appconfig.project_ref}/counters/conditions`)

  // if doc doesn't exist, create it with shards
  // do this in a transaction so we don't accidentally overwrite
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        // Initialize the counter document
        transaction.set(docRef, { num_shards: num_shards })

        // Initialize each shard with count=0
        for (let i = 0; i < num_shards; i++) {
          const shardRef = doc(db, `${mode}/${appconfig.project_ref}/counters/conditions/shards/`, i.toString())
          const newCondCounter = {}
          conditionCombos.forEach((condition) => {
            newCondCounter[condition] = 0
          })
          transaction.set(shardRef, newCondCounter)
        }
      } else {
        // if doc does exist, get shard 0 and check if it has all the conditions
        const shardRef = doc(db, `${mode}/${appconfig.project_ref}/counters/conditions/shards/`, '0')
        const shardSnap = await transaction.get(shardRef)
        const shardData = shardSnap.data()
        const shardConditions = Object.keys(shardData)
        const missingConditions = conditionCombos.filter((cond) => !shardConditions.includes(cond))
        if (missingConditions.length > 0) {
          // if there are any missing conditions, we're going to start over everything at zero and choose at random
          for (let i = 0; i < num_shards; i++) {
            const shardRef = doc(db, `${mode}/${appconfig.project_ref}/counters/conditions/shards/`, i.toString())
            const newCondCounter = {}
            conditionCombos.forEach((condition) => {
              newCondCounter[condition] = 0
            })
            transaction.set(shardRef, newCondCounter)
          }
        }
      }
    })
  } catch (e) {
    log.error('FIRESTORE-DB: Error creating counter: ', e)
  }

  // collection where the shards are
  const conditionCollection = collection(db, `${mode}/${appconfig.project_ref}/counters/conditions/shards/`)

  // get the current condition counts across all shards
  const querySnapshot = await getDocs(conditionCollection)
  let oldCondCounter = {}
  querySnapshot.forEach((doc) => {
    Object.keys(doc.data()).forEach((key) => {
      if (oldCondCounter[key]) {
        oldCondCounter[key] += doc.data()[key]
      } else {
        oldCondCounter[key] = doc.data()[key]
      }
    })
  })

  // choose a condition based on these counts
  // randomly select from among the minima
  const counts = conditionCombos.map((cond) => oldCondCounter[cond])
  const min = Math.min(...Object.values(counts))
  const matchMinConds = conditionCombos.filter((cond) => oldCondCounter[cond] === min)
  const selectedCondition = matchMinConds[Math.floor(Math.random() * matchMinConds.length)]

  // increment the count for that condition from a random shard, in a transaction
  const shard_id = Math.floor(Math.random() * num_shards).toString()
  const shard_ref = doc(db, `${mode}/${appconfig.project_ref}/counters/conditions/shards/`, shard_id)
  try {
    await runTransaction(db, async (transaction) => {
      const shard_doc = await transaction.get(shard_ref)
      // increment the count
      const new_count = shard_doc.data()[selectedCondition] + 1
      transaction.update(shard_ref, { [selectedCondition]: new_count })
    })
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating counter: ', e)
  }

  // Split back up into dictionary
  // get keys from conditionDict
  const keys = Object.keys(conditionDict)
  // split condition string based on dash
  const splitConditions = selectedCondition.split('--')
  // zip keys and splitConditions
  const selectedConditionsDict = Object.fromEntries(keys.map((key, i) => [key, splitConditions[i]]))

  log.log('FIRESTORE-DB: Conditions set to: ', selectedConditionsDict)

  return selectedConditionsDict
}

// export default createDoc
export default db

// const db_type = collection(db, mode) // or should this be collection?

// first get mode (development or live)
// next try to see if a document exists in that collection or not
// if not create one with the name of the experiment
// add code name to the document as well

// setDoc - write if document doesn’t exist, or replace if there is one at that name
// updateDoc - only overwrite fields you specify but error if doesn’t exist
// setDoc(,,{merge: true}) - create document if doesn’t exist, or update if it does
// each as async away or .then()
// addDoc gives you a random reference
// getDoc to read in with document snamshop
//   async function readASingleDocument() {
//     const mySnapshot = await getDoc(specialofthedata)
//     if (mydoc.exists()) {  // if it exists
//         const mydata = mydown.data() // method
//     }
// }
