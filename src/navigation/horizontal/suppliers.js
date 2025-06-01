export default [
  {
    title: "Suppliers",
    icon: { icon: "tabler-package-import" },
    action: "see",
    subject: "Suppliers-Navbar",
    children: [
      {
        title: "Supplier List",
        icon: { icon: "tabler-users" },
        to: 'apps-supplier-list',
        action: "read",
        subject: "Supplier",
      },
      {
        title: "Tender",
        icon: { icon: "tabler-gavel" },
        action: "see",
        subject: "Tender-Navbar",
        children: [
          {
            title: 'Active Tenders',
            icon: { icon: "tabler-checkbox" },

            to: 'apps-supplier-tender-active-tenders',
            action: 'see',
            subject: 'Tender-Navbar',
          },
          {
            title: 'Tender History',
            icon: { icon: "tabler-history" },

            to: 'apps-supplier-tender-tender-history',
            action: 'see',
            subject: 'Tender-Navbar',
          },
        ],
      },
    ],
  },
]
