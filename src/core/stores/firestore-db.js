import { initializeApp } from 'firebase/app'
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
    log.error('Error updating document', e)
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
    log.error('Error updating document', e)
  }
}

export const loadDoc = async (docid) => {
  const log = useLog()
  const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/`, docid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    const data = docSnap.data()
    // console.log('Document data:', data)
    return data
  }
  // doc.data() will be undefined in this case
  log.error('No such document!')
  return undefined
}

export const createDoc = async (data) => {
  const log = useLog()
  log.log(`FIRESTORE-DB: trying to create a main document.`)
  try {
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
    console.log('Document written with ID: ', `${mode}/${appconfig.project_ref}`)

    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, `${mode}/${appconfig.project_ref}/data`), data)
    log.log(`FIRESTORE-DB: Document written with ID: `, docRef.id)
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
    // Add a new document with a generated id.
    const docRef = doc(db, `${mode}/${appconfig.project_ref}/data/${docId}/private/`, 'private_data')
    await setDoc(docRef, data)
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
