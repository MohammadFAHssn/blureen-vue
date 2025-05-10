export default [
  {
    title: 'User Management',
    icon: { icon: 'tabler-users' },
    children: [
      {
        title: 'Users',
        icon: { icon: 'tabler-users' },
        children: [
          { title: 'List', to: 'apps-user-list' },
        ],
      },
      {
        title: 'Roles & Permissions',
        icon: { icon: 'tabler-lock' },
        children: [
          { title: 'Roles', to: 'apps-roles' },
          { title: 'Permissions', to: 'apps-permissions' },
        ],
      },
    ],
  },
]
