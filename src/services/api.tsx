import axios from 'axios'

export const API_URL = import.meta.env.VITE_APP_BACKEND_URL
const ApiService = axios.create()

ApiService.interceptors.request.use((config) => {
    const state = localStorage.getItem('auth-storage')
    const token = state ? JSON.parse(state).state.accessToken : null
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

ApiService.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response.status === 403 || error.response.status === 401)
            localStorage.removeItem('auth-storage')

        return Promise.reject(error)
    }
)

export default ApiService
