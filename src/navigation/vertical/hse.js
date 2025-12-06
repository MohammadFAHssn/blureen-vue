export default [
  {
    heading: 'HSE',
    action: 'use',
    subject: 'app',
  },
  {
    title: 'HSE User Health Certificate',
    icon: { icon: 'tabler-clipboard-heart' },
    action: 'use',
    subject: 'app',
    to: 'apps-hse-health-certificate',
  },
  {
    title: 'HSE Management',
    icon: { icon: 'tabler-hospital-circle' },
    action: 'read',
    subject: 'Health-Certificate',
    children: [
      {
        title: 'HSE Management Health Certificate',
        action: 'read',
        subject: 'Health-Certificate',
        to: 'apps-hse-health-certificate-management',
      },
    ],
  },
]
