export default [
  {
    heading: 'User Management',
    action: 'see',
    subject: 'User-Management-Navbar',
  },
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
]
