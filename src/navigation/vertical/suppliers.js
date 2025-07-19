export default [
  {
    heading: "Suppliers",
    action: "see",
    subject: "Suppliers-Navbar",
  },
  {
    title: "Tender",
    icon: { icon: "tabler-gavel" },
    action: "see",
    subject: "Tender-Navbar",
    children: [
      {
        title: "Active Tenders",
        icon: { icon: "tabler-checkbox" },
        to: "apps-supplier-tender-active-tenders",
        action: "read",
        subject: "Active-Tenders",
      },
      {
        title: "Tender History",
        to: "apps-supplier-tender-tender-history",
        icon: { icon: "tabler-history" },
        action: "read",
        subject: "Tenders-History",
      },
    ],
  },
]
