import ApiService, { API_URL } from './api'
import { Deck, DeckServiceResult, FlashcardModel } from '../models'
import { useAuthStore } from '../stores/authStore'

// Constants
const DECK_STORAGE_KEY = 'anonymous-deck-id'

// Helper functions
const getAnonymousDeckId = (): string | null => {
    return localStorage.getItem(DECK_STORAGE_KEY)
}

const setAnonymousDeckId = (deckId: string): void => {
    localStorage.setItem(DECK_STORAGE_KEY, deckId)
}

const isUserSignedIn = (): boolean => {
    const { isAuthenticated } = useAuthStore.getState()
    return isAuthenticated
}

// API functions
const fetchDeck = async (deckId: string, isAnonymous: boolean = false): Promise<Deck> => {
    const url = `${API_URL}/deck/${deckId}${isAnonymous ? '?isAnonymous=true' : ''}`
    const response = await ApiService.get(url)
    return response.data
}

const createAnonymousDeck = async (): Promise<Deck> => {
    const url = `${API_URL}/deck?addRandomKanji=true&isAnonymous=true`
    const response = await ApiService.post(url)
    return response.data
}

const fetchDeckFlashcards = async (deckId: string): Promise<FlashcardModel[]> => {
    const url = `${API_URL}/deck/${deckId}/flashcards`
    const response = await ApiService.get(url)
    console.log('Flashcards fetched:', response.data.kanjis)
    console.log('Flashcards fetched:', url)
    console.log('Flashcards fetched:', deckId)
    return response.data.kanjis
}

/**
 * Main service function to create/get deck and fetch flashcards
 * This handles the entire flashcard flow based on authentication status
 */
export const createDeck = async (): Promise<DeckServiceResult> => {
    try {
        let deck: Deck

        if (isUserSignedIn()) {
            // TODO: Handle authenticated user deck logic
            // For now, we'll throw an error to indicate this needs implementation
            throw new Error('Authenticated user deck handling not yet implemented')
        } else {
            // Handle anonymous user
            const existingDeckId = getAnonymousDeckId()

            if (existingDeckId) {
                // Try to fetch existing deck
                try {
                    console.log('Fetching existing anonymous deck:', existingDeckId)
                    deck = await fetchDeck(existingDeckId, true)
                } catch (error) {
                    console.warn('Failed to fetch existing deck, creating new one:', error)
                    // If deck doesn't exist or can't be fetched, create a new one
                    deck = await createAnonymousDeck()
                    setAnonymousDeckId(deck.id)
                }
            } else {
                // No existing deck, create new one
                console.log('Creating new anonymous deck')
                deck = await createAnonymousDeck()
                setAnonymousDeckId(deck.id)
            }
        }

        // Fetch flashcards for the deck
        console.log('Fetching flashcards for deck:', deck.id)
        const flashcards = await fetchDeckFlashcards(deck.id)

        return {
            deck,
            flashcards
        }

    } catch (error) {
        console.error('Error in createDeck service:', error)
        throw error
    }
}

/**
 * Clear anonymous deck from localStorage
 * Useful for testing or when user wants to start fresh
 */
export const clearAnonymousDeck = (): void => {
    localStorage.removeItem(DECK_STORAGE_KEY)
}

/**
 * Get current deck info without creating a new one
 */
export const getCurrentDeck = async (): Promise<Deck | null> => {
    try {
        if (isUserSignedIn()) {
            // TODO: Handle authenticated user deck logic
            return null
        } else {
            const deckId = getAnonymousDeckId()
            if (deckId) {
                return await fetchDeck(deckId, true)
            }
            return null
        }
    } catch (error) {
        console.error('Error getting current deck:', error)
        return null
    }
}

// Export as object for easier importing
export const deckService = {
    createDeck,
    clearAnonymousDeck,
    getCurrentDeck
}

export default deckService 