export default [
  {
    heading: 'Human Resources',
    action: 'read',
    subject: 'User',
  },
  {
    title: 'Requests',
    to: 'apps-human-resources-requests',
    icon: { icon: 'tabler-file-text' },
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
]
