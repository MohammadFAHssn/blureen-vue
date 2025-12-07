import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useCookie('accessToken').value
    if (accessToken)
      config.headers.Authorization = `Bearer ${accessToken}`

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401)
      useLogout()

    return Promise.reject(error)
  },
)

export default axiosInstance
