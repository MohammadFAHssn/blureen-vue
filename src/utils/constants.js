export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60

// TODO: define this in settings table in database
export const MAX_FILE_SIZE = 5 * 1024 * 1024

export const ORG_POSITION_COLORS = {
  1: '#D32F2F', // مدیر
  7: '#7B1FA2', // رئیس
  2: '#1976D2', // سرپرست
  6: '#388E3C', // مسئول
  3: '#F57C00', // سرشیفت
  5: '#455A64', // کارمند
  4: '#616161', // کارگر
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
