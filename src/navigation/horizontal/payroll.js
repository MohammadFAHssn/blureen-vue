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
    ],
  },

]
