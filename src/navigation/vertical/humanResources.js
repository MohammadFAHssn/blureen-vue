export default [
  {
    heading: 'Human Resources',
    action: 'use',
    subject: 'app',
  },
  {
    title: 'Requests',
    to: 'apps-human-resources-requests',
    icon: { icon: 'tabler-file-text' },
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
  {
    title: 'Supervisor Cartable',
    to: 'apps-human-resources-supervisor-cartable',
    icon: { icon: 'tabler-clipboard-list' },
    action: 'use',
    subject: 'app',
  },
]
