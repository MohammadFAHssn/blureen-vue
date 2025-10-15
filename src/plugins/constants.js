export const constants = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB

  HR_REQUEST_PENDING_STATUS: 1,
  HR_REQUEST_Approved_STATUS: 2,
  HR_REQUEST_REJECTED_STATUS: 3,

  HR_REQUEST_TYPE_DAILY_LEAVE: 1,
  HR_REQUEST_TYPE_HOURLY_LEAVE: 2,
  HR_REQUEST_TYPE_OVERTIME: 3,
  HR_REQUEST_TYPE_SICK_LEAVE: 4,
}

export default (app) => {
  app.provide('constants', constants)
}
