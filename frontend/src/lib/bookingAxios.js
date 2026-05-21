import axios from 'axios'

/** Chỉ dùng JWT user — không gửi admin_token (gây 403 khi verify) */
const bookingAxios = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

bookingAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

bookingAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || ''

    if (
      status === 401 ||
      (status === 403 &&
        (message.includes('Token') ||
          message.includes('token') ||
          message.includes('Phiên') ||
          message.includes('xác thực') ||
          message.includes('người dùng')))
    ) {
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
      error.authSessionExpired = true
    }

    return Promise.reject(error)
  }
)

export function getUserToken() {
  return localStorage.getItem('user_token')
}

export default bookingAxios
