import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

export const API_URL = import.meta.env.VITE_APP_BACKEND_URL
const ApiService = axios.create({
    baseURL: API_URL
})

ApiService.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

ApiService.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
            const { clearAuth } = useAuthStore.getState()
            clearAuth()
        }
        return Promise.reject(error)
    }
)

export default ApiService
