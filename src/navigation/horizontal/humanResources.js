export default [
  {
    title: 'Human Resources',
    icon: { icon: 'tabler-users' },
    action: 'use',
    subject: 'app',
    children: [
      {
        title: 'Requests',
        to: 'apps-human-resources-requests',
        icon: { icon: 'tabler-users' },
        action: 'use',
        subject: 'app',
      },
      {
        title: 'Approval Requests',
        to: 'apps-human-resources-approvals-inbox',
        icon: { icon: 'tabler-inbox' },
        action: 'use',
        subject: 'app',
      },
      {
        title: 'Human Resource Cartable',
        to: 'apps-human-resources-hr-cartable',
        icon: { icon: 'tabler-clipboard-list' },
        action: 'see',
        subject: 'HR-cartable',
      },
    ],
  },
]
