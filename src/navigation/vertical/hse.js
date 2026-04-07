export default [
  {
    title: 'HSE',
    icon: { icon: 'tabler-heart' },
    action: 'use',
    subject: 'app',
    children: [
      {
        title: 'HSE User Health Certificate',
        icon: { icon: 'tabler-clipboard-heart' },
        action: 'use',
        subject: 'app',
        to: 'apps-hse-health-certificate',
      },
      {
        title: 'HSE Management',
        icon: { icon: 'tabler-adjustments' },
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
    ],
  },
]
