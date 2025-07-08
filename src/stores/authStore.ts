import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
    accessToken: string | null
    isAuthenticated: boolean
    setToken: (token: string | null) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            isAuthenticated: false,
            setToken: (token) => set({
                accessToken: token,
                isAuthenticated: !!token
            }),
            clearAuth: () => set({
                accessToken: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'auth-storage',
        }
    )
) 