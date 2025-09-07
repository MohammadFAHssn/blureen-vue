export default [
  {
    heading: 'Suppliers',
    action: 'see',
    subject: 'Suppliers-Navbar',
  },
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
]
