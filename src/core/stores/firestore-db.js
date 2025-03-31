import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  connectFirestoreEmulator,
} from 'firebase/firestore'
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

// Add validation function as an internal helper
const validateFirestoreData = (data, path = '') => {
  // Check if value is null or undefined
  if (data === null || data === undefined) {
    return true
  }

  // Check data type
  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean' ||
    data instanceof Date ||
    (typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) // Check for Timestamp-like object
  ) {
    return true
  }

  // Check arrays
  if (Array.isArray(data)) {
    // Empty arrays are valid
    if (data.length === 0) {
      return true
    }
    for (let i = 0; i < data.length; i++) {
      if (Array.isArray(data[i])) {
        throw new Error(`Nested arrays are not allowed in Firestore at path: ${path}[${i}]`)
      }
      validateFirestoreData(data[i], `${path}[${i}]`)
    }
    return true
  }

  // Check objects
  if (typeof data === 'object') {
    // Empty objects are valid
    if (Object.keys(data).length === 0) {
      return true
    }
    for (const [key, value] of Object.entries(data)) {
      if (/[\.\/\[\]\*]/.test(key)) {
        throw new Error(`Invalid key name "${key}" at path: ${path}. Keys cannot contain ".", "/", "[", "]", or "*"`)
      }

      if (value instanceof Function || value instanceof Symbol) {
        throw new Error(`Unsupported data type for key "${key}" at path: ${path}. Value type: ${typeof value}`)
      }

      validateFirestoreData(value, path ? `${path}.${key}` : key)
    }
    return true
  }

  throw new Error(`Unsupported data type at path: ${path}. Value type: ${typeof data}`)
}

// create a collection
export const updateSubjectDataRecord = async (data, docid) => {
  const log = useLog()
  try {
    validateFirestoreData(data)
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/`, docid)
    await setDoc(docRef, data, { merge: true })
  } catch (e) {
    log.error('FIRESTORE-DB: Error updating document:', e.message)
    throw e // Re-throw to allow caller to handle the error
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
    log.error('FIRESTORE-DB: Error updating private document', e)
    throw e
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
      if (data.firebase_anon_auth_id === user.uid) {
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
}

export const createDoc = async (data) => {
  const log = useLog()
  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    validateFirestoreData(data)

    log.log(`FIRESTORE-DB: trying to create a main document.`, appconfig.project_ref)

    const expRef = doc(db, mode, appconfig.project_ref)
    // Check if document exists first
    const docSnap = await getDoc(expRef)
    if (!docSnap.exists()) {
      await setDoc(expRef, {
        project_name: appconfig.project_name,
        project_ref: appconfig.project_ref,
        code_name: appconfig.code_name,
        code_name_url: appconfig.code_name_url,
      })
      log.log('FIRESTORE-DB: New experiment registered with ID: ', `${mode}/${appconfig.project_ref}`)
    }

    log.log(`FIRESTORE-DB: trying to create a main document.`, appconfig.project_ref)

    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, `${mode}/${appconfig.project_ref}/data`), {
      ...data,
      firebase_anon_auth_id: user.uid,
    })

    // Update the document with its own ID
    await updateDoc(docRef, {
      firebase_doc_id: docRef.id,
    })

    data.firebase_anon_auth_id = user.uid
    log.log(`FIRESTORE-DB: New document written with ID: ${docRef.id} for user ${user.uid})`)
    return docRef.id
  } catch (e) {
    log.error('FIRESTORE-DB: Error creating document:', e.message)
    return null
  }
}

export const createPrivateDoc = async (data, docId) => {
  const log = useLog()
  log.log(`FIRESTORE-DB: trying to create a private document in ${docId}`)
  try {
    const user = await anonymousAuth()
    if (!user) throw new Error('Authentication failed')

    validateFirestoreData(data)
    // Add a new document with a generated id.
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/${docId}/private/`, 'private_data')
    await setDoc(docRef, {
      ...data,
      firebase_anon_auth_id: user.uid,
    })
    log.log(`FIRESTORE-DB: Private document written with ID: `, docRef.id)
    return docRef.id
  } catch (e) {
    log.error('FIRESTORE-DB: Error adding private document: ', e)
    return null
  }
}

// export default createDoc
export default db

// const db_type = collection(db, mode) // or should this be collection?

// first get mode (development or live)
// next try to see if a document exists in that collection or not
// if not create one with the name of the experiment
// add code name to the document as well

// setDoc - write if document doesn't exist, or replace if there is one at that name
// updateDoc - only overwrite fields you specify but error if doesn't exist
// setDoc(,,{merge: true}) - create document if doesn't exist, or update if it does
// each as async away or .then()
// addDoc gives you a random reference
// getDoc to read in with document snamshop
//   async function readASingleDocument() {
//     const mySnapshot = await getDoc(specialofthedata)
//     if (mydoc.exists()) {  // if it exists
//         const mydata = mydown.data() // method
//     }
// }
