import moment from 'moment-jalaali'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

export default function (app) {
  app.config.globalProperties.$moment = moment
  app.provide('moment', moment)
}
