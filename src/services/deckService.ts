import ApiService from './api'
import { Deck, DeckServiceResult, FlashcardModel } from '../models'
import { useAuthStore } from '../stores/authStore'

// API functions
const fetchUserDecks = async (): Promise<Deck[]> => {
    const response = await ApiService.get('/deck/user/decks')
    return response.data
}

const createUserDeck = async (): Promise<Deck> => {
    const response = await ApiService.post('/deck', { addRandomKanji: true })
    return response.data
}

const fetchDeckFlashcards = async (deckId: string): Promise<FlashcardModel[]> => {
    const response = await ApiService.get(`/deck/${deckId}/flashcards`)
    return response.data.kanjis
}

/**
 * Main service function to get or create deck and fetch flashcards
 * This handles the entire flashcard flow for authenticated users (both guest and registered)
 */
export const createDeck = async (): Promise<DeckServiceResult> => {
    try {
        const { ensureAuth } = useAuthStore.getState()


        await ensureAuth()


        let userDecks: Deck[]
        try {
            console.log('🔍 Fetching existing user decks...')
            userDecks = await fetchUserDecks()
            console.log('✅ Existing decks found:', userDecks.length, userDecks)
        } catch (error) {
            console.warn('❌ Failed to fetch user decks, will create new one:', error)
            userDecks = []
        }

        let deck: Deck

        if (userDecks.length > 0) {
            // Use the first deck (or implement logic to choose specific deck)
            console.log('🎯 Using existing deck:', userDecks[0])
            deck = userDecks[0]
        } else {
            // Create a new deck for the user
            console.log('🆕 No existing decks found - creating new deck for user')
            deck = await createUserDeck()
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
 * Get user's decks
 */
export const getUserDecks = async (): Promise<Deck[]> => {
    try {
        const { ensureAuth } = useAuthStore.getState()
        await ensureAuth()
        return await fetchUserDecks()
    } catch (error) {
        console.error('Error getting user decks:', error)
        throw error
    }
}

/**
 * Get current deck info without creating a new one
 */
export const getCurrentDeck = async (): Promise<Deck | null> => {
    try {
        const decks = await getUserDecks()
        return decks.length > 0 ? decks[0] : null
    } catch (error) {
        console.error('Error getting current deck:', error)
        return null
    }
}

/**
 * Create a new deck for the user
 */
export const createNewDeck = async (): Promise<Deck> => {
    try {
        const { ensureAuth } = useAuthStore.getState()
        await ensureAuth()
        return await createUserDeck()
    } catch (error) {
        console.error('Error creating new deck:', error)
        throw error
    }
}

export const deckService = {
    createDeck,
    getUserDecks,
    getCurrentDeck,
    createNewDeck
}

export default deckService 