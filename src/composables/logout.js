import { useRouter } from 'vue-router'

export const logout = async () => {

  // Remove "accessToken" from cookie
  useCookie('accessToken').value = null

  // Remove "userData" from cookie
  const userData = useCookie('userData')

  userData.value = null

  // Redirect to login page
  const router = useRouter()

  await router.push({ path: '/login', params: { redirected: true } })

  // ℹ️ We had to remove abilities in then block because if we don't nav menu items mutation is visible while redirecting user to login page

  // Remove "userAbilities" from cookie
  useCookie('userAbilityRules').value = null

  // Reset ability to initial ability
  ability.update([])
}
