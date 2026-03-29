import axios from "axios"
import Cookies from "js-cookie"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
})

// ✅ Intercepteur requête — ajoute le token JWT
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ Intercepteur réponse — refresh token si expiré
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = Cookies.get("refresh_token")
      if (refresh) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/users/refresh/`,
            { refresh }
          )
          Cookies.set("access_token", res.data.access)
          original.headers.Authorization = `Bearer ${res.data.access}`
          return api(original)
        } catch {
          Cookies.remove("access_token")
          Cookies.remove("refresh_token")
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api