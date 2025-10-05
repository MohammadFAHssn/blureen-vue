export default [
  {
    title: 'Human Resources',
    icon: { icon: 'tabler-id' },
    action: 'read',
    subject: 'User',
    children: [
      {
        title: 'Requests',
        to: 'apps-human-resources-requests',
        icon: { icon: 'tabler-file-text' },
        action: 'read',
        subject: 'User',
      },
    ],
  },
]
