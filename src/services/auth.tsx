import ApiService from './api.js'
import { getDeviceId } from '../utils/funcs'

export interface RegisterPayload {
    email: string
    username: string
    password: string
}

export interface LoginPayload {
    emailOrUsername: string
    password: string
}

export interface GuestUserResponse {
    accessToken: string
    userId: string
    username?: string
    isGuest: boolean
}

export interface AuthResponse {
    accessToken: string
    userId: string
    username: string
    isGuest: boolean
}

// Create a guest user
export const createGuestUser = async (): Promise<GuestUserResponse> => {
    const deviceId = getDeviceId()
    const response = await ApiService.post('/auth/guest', { deviceId })
    return response.data
}

export const _login = async (params: LoginPayload): Promise<AuthResponse> => {
    const response = await ApiService.post('/auth/login', params)
    return response.data
}

export const _register = async (params: RegisterPayload): Promise<AuthResponse> => {
    const response = await ApiService.post('/auth/register', params)
    return response.data
}
