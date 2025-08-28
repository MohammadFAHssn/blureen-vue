export default [
  {
    title: 'Suppliers',
    icon: { icon: 'tabler-package-import' },
    action: 'see',
    subject: 'Suppliers-Navbar',
    children: [
      {
        title: 'Tender',
        icon: { icon: 'tabler-gavel' },
        action: 'see',
        subject: 'Tender-Navbar',
        children: [
          {
            title: 'Active Tenders',
            icon: { icon: 'tabler-checkbox' },

            to: 'apps-supplier-tender-active-tenders',
            action: 'read',
            subject: 'Active-Tenders',
          },
        ],
      },
    ],
  },
]
