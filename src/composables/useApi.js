import { createFetch } from "@vueuse/core"
import { destr } from "destr"

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  fetchOptions: {
    headers: {
      Accept: "application/json",
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ url, options }) {

      if (options.skipBaseUrl) {
        console.log(url)
        url = url.replace("/api", "")
        console.log(url)
      } 

      const accessToken = useCookie("accessToken").value
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }

      return { url, options }
    },
    afterFetch(ctx) {
      const { data, response } = ctx

      // Parse data if it's JSON
      let parsedData = null
      try {
        parsedData = destr(data)
      } catch (error) {
        console.error(error)
      }

      return { data: parsedData, response }
    },
    onFetchError(ctx) {
      if (ctx.response.status === 401) {
        useLogout()
      }
      
      let parsedError = null
      try {
        parsedError = destr(ctx.data)
      } catch (error) {
        console.error(error)
      }

      return { error: parsedError }
    },
  },
})
