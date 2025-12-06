export default [
  {
    heading: 'Evaluation And Survey',
    action: 'use',
    subject: 'app',
  },
  {

    title: 'Evaluation',
    icon: { icon: 'tabler-user-star' },
    action: 'use',
    subject: 'app',
    children: [
      {
        title: 'Peer Evaluation',
        action: 'use',
        subject: 'app',
        to: 'apps-evaluation-peer-evaluation',
      },
      {
        title: 'Self Evaluation',
        action: 'use',
        subject: 'app',
        to: 'apps-evaluation-self-evaluation',
      },
    ],
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
    action: 'read',
    subject: 'Surveys',
    to: 'apps-survey-survey-management',
  },

]
