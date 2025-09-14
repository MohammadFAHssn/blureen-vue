export default [
  {
    title: 'User Management',
    icon: { icon: 'tabler-users' },
    action: 'see',
    subject: 'User-Management-Navbar',
    children: [
      {
        title: 'Users',
        icon: { icon: 'tabler-users' },
        action: 'see',
        subject: 'User',
        children: [
          {
            title: 'List',
            to: 'apps-user-list',
            action: 'read',
            subject: 'User-Details',
          },
          {
            title: 'Access',
            to: 'apps-user-access',
            action: 'read',
            subject: 'User-Access',
          },
          {
            title: 'Approval Levels',
            to: 'apps-user-organization-chart',
            action: 'read',
            subject: 'Approval-Levels',
          },
        ],
      },
      {
        title: 'Roles & Permissions',
        icon: { icon: 'tabler-lock' },
        children: [
          {
            title: 'Roles',
            to: 'apps-roles',
          },
          {
            title: 'Permissions',
            to: 'apps-permissions',
          },
        ],
      },
    ],
  },
]
