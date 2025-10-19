import { isEmpty, isEmptyArray, isNullOrUndefined } from './helpers'

// 👉 Required Validator
export function requiredValidator(value) {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'پر کردن این فیلد الزامی است'

  return !!String(value).trim().length || 'پر کردن این فیلد الزامی است'
}

// 👉 Email Validator
export function emailValidator(value) {
  if (isEmpty(value))
    return true

  const re
    = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-\d]+\.)+[a-z]{2,})$/i

  if (Array.isArray(value)) {
    return (
      value.every(val => re.test(String(val)))
      || 'The Email field must be a valid email'
    )
  }

  return re.test(String(value)) || 'The Email field must be a valid email'
}

// 👉 Password Validator
export function passwordValidator(password) {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/
  const validPassword = regExp.test(password)

  return (
    validPassword
    || 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ و کوچک انگلیسی و اعداد باشد'
  )
}

// 👉 Confirm Password Validator
export function confirmedValidator(value, target) {
  return (
    value === target || 'در این فیلد باید همان مقدار فیلد رمز عبور جدید، عیناً وارد شود'
  )
}

// 👉 Between Validator
export function betweenValidator(value, min, max) {
  const valueAsNumber = Number(value)

  return (
    (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber)
    || `Enter number between ${min} and ${max}`
  )
}

// 👉 Integer Validator
export function integerValidator(value) {
  if (isEmpty(value))
    return true
  if (Array.isArray(value)) {
    return (
      value.every(val => /^-?\d+$/.test(String(val)))
      || 'This field must be an integer'
    )
  }

  return /^-?\d+$/.test(String(value)) || 'This field must be an integer'
}

// 👉 Regex Validator
export function regexValidator(value, regex) {
  if (isEmpty(value))
    return true
  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)
  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))

  return regeX.test(String(value)) || 'The Regex field format is invalid'
}

// 👉 Alpha Validator
export function alphaValidator(value) {
  if (isEmpty(value))
    return true

  return (
    /^[A-Z]*$/i.test(String(value))
    || 'The Alpha field may only contain alphabetic characters'
  )
}

// 👉 URL Validator
export function urlValidator(value) {
  if (isEmpty(value))
    return true
  const re = /^https?:\/\/[^\s$.?#].\S*$/

  return re.test(String(value)) || 'URL is invalid'
}

// 👉 Length Validator
export function lengthValidator(value, length) {
  if (isEmpty(value))
    return true

  return (
    String(value).length === length
    || `"The length of the Characters field must be ${length} characters."`
  )
}

// 👉 Alpha-dash Validator
export function alphaDashValidator(value) {
  if (isEmpty(value))
    return true
  const valueAsString = String(value)

  return /^[\w-]*$/.test(valueAsString) || 'All Character are not valid'
}

// 👉 Mobile Number Validator
export function mobileNumberValidator(value) {
  const valueAsString = String(value)

  return /^09\d{9}$/.test(valueAsString) || 'شماره تلفن معتبر نیست'
}
