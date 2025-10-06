export default [
  {
    title: 'Payroll',
    icon: { icon: 'tabler-currency-dollar' },
    action: 'use',
    subject: 'app',
    children: [
      {
        title: 'Payroll Slip',
        icon: { icon: 'tabler-file-dollar' },
        action: 'use',
        subject: 'app',
        to: 'apps-payroll-payroll-slip',
      },
      {
        title: 'Payroll Batches Management',
        icon: { icon: 'tabler-settings-dollar' },
        action: 'read',
        subject: 'Payroll-Batches',
        to: 'apps-payroll-payroll-batches-management',
      },
      {
        title: 'Payroll Birthday',
        icon: { icon: 'tabler-gift' },
        action: 'use',
        subject: 'app',
        to: 'apps-payroll-birthday-birthday-user',
      },
      {
        title: 'Payroll Birthday Management',
        icon: { icon: 'tabler-adjustments' },
        action: 'use',
        subject: 'app',
        children: [
          {
            title: 'Payroll Birthday Management file',
            icon: { icon: 'tabler-file' },
            action: 'use',
            subject: 'app',
            to: 'apps-payroll-birthday-birthday-admin-file',
          },
          {
            title: 'Payroll Birthday Management gift',
            icon: { icon: 'tabler-gift' },
            action: 'use',
            subject: 'app',
            to: 'apps-payroll-birthday-birthday-admin-gift',
          },
        ]
      },
    ],
  },

]
