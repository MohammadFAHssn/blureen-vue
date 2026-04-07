export default [
  {
    title: 'Suppliers',
    icon: { icon: 'tabler-truck-delivery' },
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
            to: 'apps-supplier-tender-active-tenders',
            action: 'read',
            subject: 'Active-Tenders',
          },
        ],
      },
    ],
  },
]
