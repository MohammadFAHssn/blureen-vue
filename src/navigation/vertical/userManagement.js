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
        title: 'List',
        to: 'apps-user-list',
        action: 'read',
        subject: 'User',
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

    // TODO: Add actions and subjects for roles and permissions
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
]
