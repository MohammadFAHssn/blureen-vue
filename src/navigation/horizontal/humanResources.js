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
    ],
  },
]
