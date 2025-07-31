import type { App } from 'vue'
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker'

export default function (app: App) {
  app.component('PersianDatetimePicker', Vue3PersianDatetimePicker)
}
