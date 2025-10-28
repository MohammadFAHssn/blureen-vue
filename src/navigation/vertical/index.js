import humanResources from '@/navigation/vertical/humanResources.js'
import evaluationAndSurvey from './evaluation-and-survey'
import home from './home'
import payroll from './payroll'
import suppliers from './suppliers'
import userManagement from './userManagement'

export default [...home, ...payroll, ...evaluationAndSurvey, ...suppliers, ...userManagement, ...humanResources]
