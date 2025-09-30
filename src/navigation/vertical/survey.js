export default [
  {
    heading: 'Survey',
    action: 'use',
    subject: 'app',
  },
  {
    title: 'Survey',
    icon: { icon: 'tabler-message-2-question' },
    action: 'use',
    subject: 'app',
    to: 'apps-survey-survey',
  },
  {
    title: 'Survey Management',
    icon: { icon: 'tabler-message-cog' },
    // TODO: add permission
    action: 'use',
    subject: 'app',
    to: 'apps-survey-survey-management',
  },
]
