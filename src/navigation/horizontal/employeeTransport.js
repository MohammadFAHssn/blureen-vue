export default [
  {
    title: 'EMPLOYEE TRANSPORT',
    icon: { icon: 'tabler-car' },
    action: 'read',
    subject: 'Em-Management',
    children: [
      {
        title: 'EMPLOYEE TRANSPORT Service',
        to: 'apps-employee-transport-em-user',
        icon: { icon: 'tabler-bus' },
        action: 'read',
        subject: 'em-user',
      },
      {
        title: 'EMPLOYEE TRANSPORT Management',
        to: 'apps-employee-transport-em-management',
        icon: { icon: 'tabler-adjustments' },
        action: 'read',
        subject: 'Em-Management',
      },
    ],
  },
]
