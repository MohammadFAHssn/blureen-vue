// 👉 IsEmpty
export function isEmpty(value) {
  if (value === null || value === undefined || value === '') return true

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
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
