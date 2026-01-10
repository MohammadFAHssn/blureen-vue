export default [
  {
    title: 'Human Resources',
    icon: { icon: 'tabler-users' },
    action: 'read',
    subject: 'User',
    children: [
      {
        title: 'Requests',
        to: 'apps-human-resources-requests',
        icon: { icon: 'tabler-users' },
        action: 'read',
        subject: 'User',
      },
      {
        title: 'Approval Requests',
        to: 'apps-human-resources-approvals-inbox',
        icon: { icon: 'tabler-inbox' },
        action: 'read',
        subject: 'User',
      },
    ],
  },
]
