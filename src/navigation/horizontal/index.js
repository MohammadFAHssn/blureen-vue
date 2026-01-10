import contractor from './contractor'
import evaluationAndSurvey from './evaluation-and-survey'
import food from './food.js'
import home from './home'
import hse from './hse'
import humanResources from './humanResources.js'
import payroll from './payroll'
import suppliers from './suppliers'
import userManagement from './userManagement'

export default [
  ...food,
  ...home,
  ...contractor,
  ...payroll,
  ...evaluationAndSurvey,
  ...hse,
  ...suppliers,
  ...userManagement,
  ...humanResources,
]
