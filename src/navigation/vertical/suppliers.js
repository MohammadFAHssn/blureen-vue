export default [
  {
    heading: "Suppliers",
    action: "see",
    subject: "Suppliers-Navbar",
  },
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

        // to: 'apps-user-list',
        action: 'see',
        subject: 'Tender-Navbar',
      },
      {
        title: 'Tender History',

        // to: 'apps-user-list',
        icon: { icon: "tabler-history" },
        action: 'see',
        subject: 'Tender-Navbar',
      },
    ],
  },
]
