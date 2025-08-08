import { router } from '@/plugins/1.router/index'

export async function useLogout() {
  // Remove "accessToken" from cookie
  useCookie('accessToken').value = null

  // Remove "userData" from cookie
  const userData = useCookie('userData')

  // Redirect to login page
  if (userData.value.role.includes('supplier')) {
    await router.replace({
      path: '/login-supplier',
      query: { isRedirectedFromUnauthorizedStatus: true },
    })
  } else {
    await router.replace({
      path: '/login',
      query: { isRedirectedFromUnauthorizedStatus: true },
    })
  }

  userData.value = null

  // ℹ️ We had to remove abilities in then block because if we don't nav menu items mutation is visible while redirecting user to login page

  // Remove "userAbilities" from cookie
  useCookie('userAbilityRules').value = null

  // Reset ability to initial ability
  // const ability = useAbility()

  // ability.update([])
}
