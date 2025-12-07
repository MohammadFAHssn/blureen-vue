export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60

// TODO: define this in settings table in database
export const MAX_FILE_SIZE = 5 * 1024 * 1024

export const ORG_POSITION_COLORS = {
  1: '#005CFF', // مدیر
  3: '#E65100', // سرپرست
  5: '#008C4A', // سرشیفت
  6: '#D19400', // کارگر
}

export const HR_REQUEST_STATUSES = {
  HR_REQUEST_PENDING_STATUS: 1,
  HR_REQUEST_Approved_STATUS: 2,
  HR_REQUEST_REJECTED_STATUS: 3,
}

export const HR_REQUEST_TYPES = {
  DAILY_LEAVE: 1,
  HOURLY_LEAVE: 2,
  OVERTIME: 3,
  SICK_LEAVE: 4,
}
