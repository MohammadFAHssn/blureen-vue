import evaluationAndSurvey from './evaluation-and-survey'
import food from './food'
import home from './home'
import hse from './hse'
import payroll from './payroll'
import suppliers from './suppliers'
import userManagement from './userManagement'

export default [...home, ...payroll, ...evaluationAndSurvey, ...food, ...hse, ...suppliers, ...userManagement]
