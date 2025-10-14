export default [
  {
    heading: 'HSE',
    action: 'use',
    subject: 'app',
  },
  {
    title: 'HSE User',
    icon: { icon: 'tabler-clipboard-heart' },
    action: 'use',
    subject: 'app',
    to: 'apps-hse-health-certificate',
  },
  {
    title: 'HSE Management',
    icon: { icon: 'tabler-hospital-circle' },
    action: 'use',
    subject: 'app',
    children: [
      {
        title: 'HSE Management Health Certificate',
        action: 'use',
        subject: 'app',
        to: 'apps-hse-health-certificate-management',
      },
    ],
  },
]
