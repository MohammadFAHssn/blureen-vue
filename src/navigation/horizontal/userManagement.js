export default [
  {
    title: 'User Management',
    icon: { icon: 'tabler-users' },
    action: 'manage',
    subject: 'User',
    children: [
      {
        title: 'Users',
        icon: { icon: 'tabler-users' },
        action: 'read',
        subject: 'User',
        children: [
          {
            title: 'List', to: 'apps-user-list',
            action: 'read',
            subject: 'User',
          },
        ],
      },
      {
        title: 'Roles & Permissions',
        icon: { icon: 'tabler-lock' },
        children: [
          {
            title: 'Roles', to: 'apps-roles',
          },
          {
            title: 'Permissions', to: 'apps-permissions',
          },
        ],
      },
    ],
  },
]
