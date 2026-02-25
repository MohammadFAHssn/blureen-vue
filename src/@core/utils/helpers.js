// 👉 IsEmpty
export function isEmpty(value) {
  if (value === null || value === undefined || value === '')
    return true

  return !!(Array.isArray(value) && value.length === 0)
}

// 👉 IsNullOrUndefined
export function isNullOrUndefined(value) {
  return value === null || value === undefined
}

// 👉 IsEmptyArray
export function isEmptyArray(arr) {
  return Array.isArray(arr) && arr.length === 0
}

// 👉 IsObject
export function isObject(obj) {
  return obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)
}

// 👉 IsToday
export function isToday(date) {
  const today = new Date()

  return (
    date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear()
  )
}

// 👉 Get Jalali Month Name By Index
export function getJalaliMonthNameByIndex(monthIndex) {
  const jalaliMonthNames = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ]

  return jalaliMonthNames[monthIndex - 1] ?? null
}

export function toComparisonKey(str) {
  return (str ?? '')
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/ء/g, '')
    .replace(/ـ/g, '')
    .replace(/[\s\u200C\u200F\u200E]+/g, '')
}
