export default [
  {
    heading: 'User Management',
    action: 'manage',
    subject: 'users',
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users' },
    action: 'manage',
    subject: 'users',
    children: [
      { title: 'List', to: 'apps-user-list' },
    ],
  },
  {
    title: 'Roles & Permissions',
    icon: { icon: 'tabler-lock' },
    action: 'manage',
    subject: 'users',
    children: [
      { title: 'Roles', to: 'apps-roles' },
      { title: 'Permissions', to: 'apps-permissions' },
    ],
  },
]
