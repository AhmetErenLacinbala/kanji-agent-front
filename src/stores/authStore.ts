import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createGuestUser, _register, _login, type AuthResponse, type RegisterPayload, type LoginPayload } from '../services/auth'

interface AuthState {
    accessToken: string | null
    userId: string | null
    username: string | null
    isAuthenticated: boolean
    isGuest: boolean
    isLoading: boolean
    setAuth: (authData: { accessToken: string; userId: string; username?: string; isGuest: boolean }) => void
    clearAuth: () => void
    ensureAuth: () => Promise<void>
    login: (params: LoginPayload) => Promise<AuthResponse>
    register: (params: RegisterPayload) => Promise<AuthResponse>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            userId: null,
            username: null,
            isAuthenticated: false,
            isGuest: false,
            isLoading: false,

            setAuth: ({ accessToken, userId, username, isGuest }) => set({
                accessToken,
                userId,
                username: username || null,
                isAuthenticated: true,
                isGuest,
                isLoading: false
            }),

            clearAuth: () => set({
                accessToken: null,
                userId: null,
                username: null,
                isAuthenticated: false,
                isGuest: false,
                isLoading: false
            }),

            // Ensure user has authentication (create guest if needed)
            ensureAuth: async () => {
                const state = get()
                if (state.isAuthenticated && state.accessToken) {
                    return // Already authenticated
                }

                set({ isLoading: true })
                try {
                    const guestData = await createGuestUser()
                    set({
                        accessToken: guestData.accessToken,
                        userId: guestData.userId,
                        username: guestData.username || null,
                        isAuthenticated: true,
                        isGuest: true,
                        isLoading: false
                    })
                } catch (error) {
                    console.error('Failed to create guest user:', error)
                    set({ isLoading: false })
                    throw error
                }
            },

            // Login existing user
            login: async (params: LoginPayload) => {
                set({ isLoading: true })
                try {
                    const authData = await _login(params)
                    set({
                        accessToken: authData.accessToken,
                        userId: authData.userId,
                        username: authData.username,
                        isAuthenticated: true,
                        isGuest: false,
                        isLoading: false
                    })
                    return authData
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            },

            // Register user (converts guest to registered user)
            register: async (params: RegisterPayload) => {
                set({ isLoading: true })
                try {
                    const authData = await _register(params)
                    set({
                        accessToken: authData.accessToken,
                        userId: authData.userId,
                        username: authData.username,
                        isAuthenticated: true,
                        isGuest: false,
                        isLoading: false
                    })
                    return authData
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            }
        }),
        {
            name: 'auth-storage',
        }
    )
) 