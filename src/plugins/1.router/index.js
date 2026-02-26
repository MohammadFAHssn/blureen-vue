import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { routes as fileRoutes } from 'vue-router/auto-routes' // ← آرایهٔ مسیرهای خودکار
import { routes as extraRoutes, redirects } from './additional-routes'
import { setupGuards } from './guards'

// اگر لازم داری می‌تونی این تابع را حذف کنی؛ setupLayouts مستقیم روی آرایه جواب می‌دهد.
function recursiveLayouts(route) {
  if (route.children)
    return route

  return setupLayouts([route])[0]
}

// 1) مسیرهای خودکار + مسیرهای دستی را با هم ادغام کن
const merged = [...fileRoutes, ...extraRoutes]

// 2) لایوت‌ها را اعمال کن (برای redirectها لازم نیست)
const routesWithLayouts = setupLayouts(merged)

// 3) در نهایت redirectها را اول صف اضافه کن
const routes = [...redirects, ...routesWithLayouts]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes, // ← دیگه extendRoutes نداریم
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }

    return { top: 0 }
  },
})

// 🔄 Handle chunk load failures after new deployments
// When a new build is deployed, old chunk files no longer exist on the server.
// Catch the error and reload the page so the browser fetches the new HTML + chunks.
router.onError((error, to) => {
  const dynamicImportErrors = [
    'Failed to fetch dynamically imported module',
    'Importing a module script failed',
    'error loading dynamically imported module', // Firefox
  ]

  const isDynamicImportError = dynamicImportErrors.some(msg =>
    error.message?.toLowerCase().includes(msg.toLowerCase()),
  )

  if (isDynamicImportError) {
    // Reload the target URL to get fresh assets
    window.location.assign(to.fullPath)
  }
})

setupGuards(router)
export { router }
export default function (app) {
  app.use(router)
}
