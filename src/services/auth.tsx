import ApiService, { API_URL } from './api.js'

export interface RegisterPayload {
    email: string
    name: string
    password: string
}

export const _register = async (params: RegisterPayload) => {
    const url = `${API_URL}/auth/register`
    const response = await ApiService.post(url, params)
    return response.data
}
