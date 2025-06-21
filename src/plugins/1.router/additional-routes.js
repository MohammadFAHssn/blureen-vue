// 👉 Redirects
export const redirects = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: "/",
    name: "index",
    redirect: to => {
      // TODO: Get type from backend
      // const userData = useCookie('userData')
      // const userRole = userData.value?.role

      // if (userRole === 'Super Admin')
      //   return { name: 'dashboards-crm' }
      // if (userRole === 'client')
      //   return { name: 'access-control' }

      return { name: "dashboards-crm" }

      // return { name: 'login', query: to.query }
    },
  },
]
export const routes = []
