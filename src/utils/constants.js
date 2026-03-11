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

export const STATUSES = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  REJECTED_BY_SYSTEM: 4,
  PENDING_HR_APPROVAL: 5,
  REJECTED_BY_HR: 6,
  PENDING_SUPERVISOR_APPROVAL: 7,
  PENDING_SECURITY_APPROVAL: 8,
  PENDING_LIAISON_APPROVAL: 9,
}

export const HR_REQUEST_TYPES = {
  DAILY_LEAVE: 1,
  HOURLY_LEAVE: 2,
  OVERTIME: 3,
}

export const HR_REQUEST_DETAILS_TITLE = {
  description: 'توضیحات',
  replacement_user: 'جایگزین',
}
