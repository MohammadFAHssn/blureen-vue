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
    ],
  },
]
