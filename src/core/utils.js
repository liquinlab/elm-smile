import useSmileStore from '@/core/stores/smiledata' // get access to the global store
import useAPI from '@/core/composables/useAPI'

export function getQueryParams() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const queryDict = {}
  for (const [key, value] of urlParams.entries()) {
    queryDict[key] = value
  }
  return queryDict
}

export function processQuery(query, service) {
  const smilestore = useSmileStore()
  const urlParams = query
  const api = useAPI()

  if (!urlParams) return // do nothing if no query

  if (service === 'prolific' && urlParams.PROLIFIC_PID && urlParams.STUDY_ID && urlParams.SESSION_ID) {
    // this is a prolific experiment
    api.log('Prolific mode')
    smilestore.setRecruitmentService(service, {
      prolific_id: urlParams.PROLIFIC_PID,
      study_id: urlParams.STUDY_ID,
      session_id: urlParams.SESSION_ID,
    })
  } else if (service === 'cloudresearch' && urlParams.assignmentId && urlParams.hitId && urlParams.workerId) {
    api.log('CloudResearch mode')
    smilestore.setRecruitmentService(service, {
      worker_id: urlParams.workerId,
      hit_id: urlParams.hitId,
      assignment_id: urlParams.assignmentId,
    })
  } else if (service === 'mturk' && urlParams.assignmentId && urlParams.hitId && urlParams.workerId) {
    if (urlParams.assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      api.log('AMT mode, but no assignment (preview mode)')
      // supposed to show the ad here
    } else {
      api.log('AMT mode, with assignment')
      smilestore.setRecruitmentService(service, {
        worker_id: urlParams.workerId,
        hit_id: urlParams.hitId,
        assignment_id: urlParams.assignmentId,
      })
    }
  } else if (
    service === 'citizensci' &&
    urlParams.CITIZEN_ID &&
    urlParams.CITIZEN_STUDY_ID &&
    urlParams.CITIZEN_SESSION_ID
  ) {
    api.log('Future citizen mode')
    smilestore.setRecruitmentService(service, {
      citizen_id: urlParams.CITIZEN_ID,
      study_id: urlParams.CITIZEN_STUDY_ID,
      session_id: urlParams.CITIZEN_SESSION_ID,
    })
  } else {
    // api.log('const { next, prev } = useTimeline() mode')
  }
}

export default processQuery
