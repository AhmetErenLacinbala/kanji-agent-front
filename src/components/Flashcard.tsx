import { useEffect, useState } from 'react'
import { Card, Button, Radio, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Sentence, Deck, FlashcardModel } from '../models'
import { getRandomItems } from '../utils/funcs'
import { createDeck } from '../services/deckService'
import { useAuthStore } from '../stores/authStore'
import ApiService from '../services/api'
import Word from './Word'

type KanjiProgress = {
    kanjiId: string;
    isCorrect: boolean | null;
    hasBeenAnsweredCorrectly: boolean;
    attempts: number;
}

const Flashcard = () => {
    const [flashcards, setFlashcards] = useState<FlashcardModel[]>([])
    const [currentDeck, setCurrentDeck] = useState<Deck | null>(null)
    const [selectedSentence, setSelectedSentence] = useState<Sentence>({
        id: "",
        sentence: "",
        meaning: "",
        kana: "",
        usedKanjiForm: "",
        kanjiId: "",
        whitelist: [],
        tokenized: []
    })
    const [selectedChoice, setSelectedChoice] = useState(null)
    const [choices, setChoices] = useState<string[]>([])
    const [showAnswer, setShowAnswer] = useState(false)
    const [showMeaning, setShowMeaning] = useState(false)
    const [showKana, setShowKana] = useState(false)
    const [loading, setLoading] = useState(true)

    // Spaced repetition state
    const [kanjiProgress, setKanjiProgress] = useState<Map<string, KanjiProgress>>(new Map())
    const [activeFlashcards, setActiveFlashcards] = useState<FlashcardModel[]>([])
    const [isStudySessionComplete, setIsStudySessionComplete] = useState(false)
    const [isSubmittingResults, setIsSubmittingResults] = useState(false)

    const navigate = useNavigate()
    const { isLoading: authLoading, isGuest, isAuthenticated, username } = useAuthStore()

    useEffect(() => {
        const initializeDeck = async () => {
            try {
                setLoading(true)
                console.log('Initializing flashcard session...')

                const { deck, flashcards: deckFlashcards } = await createDeck()

                console.log('Deck loaded:', deck)
                console.log('Flashcards loaded:', deckFlashcards)
                console.log('User type:', isGuest ? 'Guest' : 'Registered')

                setCurrentDeck(deck)
                setFlashcards(deckFlashcards)
                setActiveFlashcards(deckFlashcards)

                const initialProgress = new Map<string, KanjiProgress>()
                deckFlashcards.forEach(flashcard => {
                    initialProgress.set(flashcard.kanji.id, {
                        kanjiId: flashcard.kanji.id,
                        isCorrect: null,
                        hasBeenAnsweredCorrectly: false,
                        attempts: 0
                    })
                })
                setKanjiProgress(initialProgress)

            } catch (error) {
                console.error('Failed to initialize deck:', error)
                message.error('Failed to load flashcards. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        initializeDeck()
    }, [])

    useEffect(() => {
        if (activeFlashcards.length > 0 && selectedSentence.id === "") {
            generateQuestion()
            console.log('Total flashcards available:', flashcards.length)
            console.log('Active flashcards in queue:', activeFlashcards.length)
        } else if (flashcards.length > 0 && activeFlashcards.length === 0 && !isStudySessionComplete && selectedSentence.id !== "") {

            setIsStudySessionComplete(true)
            message.success('🎉 Deck completed! All kanji have been studied.')
        }
    }, [activeFlashcards, flashcards])

    const generateQuestion = () => {
        if (activeFlashcards.length === 0) return

        const randomFlashcard: FlashcardModel = activeFlashcards[Math.floor(Math.random() * activeFlashcards.length)]
        const randomKanji: Sentence = randomFlashcard.kanji.exampleSentences[0]
        console.log('Selected flashcard:', randomFlashcard)

        setSelectedSentence(randomKanji)
        console.log("randomFlashcard", randomFlashcard);

        const wrongChoices = randomKanji.whitelist.filter(item => item !== randomKanji.usedKanjiForm);
        const selectedWrongChoices = getRandomItems(wrongChoices, Math.min(5, wrongChoices.length));

        const allChoices = [...selectedWrongChoices, randomKanji.usedKanjiForm];

        const shuffledChoices = getRandomItems(allChoices, allChoices.length);

        setChoices(shuffledChoices)
        setSelectedChoice(null)
        setShowAnswer(false)
        setShowKana(false)
        setShowMeaning(false)
    }

    const handleSubmit = () => {
        if (!selectedChoice) {
            message.warning('Please select an option first')
            return
        }

        const isCorrect = selectedChoice === selectedSentence.usedKanjiForm
        const currentKanjiId = selectedSentence.kanjiId


        setKanjiProgress(prev => {
            const updated = new Map(prev)
            const progress = updated.get(currentKanjiId)

            if (progress) {

                progress.attempts += 1

                if (isCorrect) {
                    progress.hasBeenAnsweredCorrectly = true


                    if (progress.isCorrect === null) {
                        progress.isCorrect = true
                    }

                } else {

                    if (progress.isCorrect === null) {
                        progress.isCorrect = false
                    }
                }

                updated.set(currentKanjiId, progress)
            }

            return updated
        })

        // If answered correctly, remove from active queue
        if (isCorrect) {
            setActiveFlashcards(prev => prev.filter(f => f.kanji.id !== currentKanjiId))
        }

        setShowAnswer(true)
    }

    const handleNext = () => {
        if (activeFlashcards.length > 0) {
            generateQuestion()
        } else {
            setIsStudySessionComplete(true)
            message.success('🎉 Deck completed! Your progress will be saved automatically.')
        }
    }

    const submitStudyResults = async () => {
        if (!currentDeck || isSubmittingResults) return

        setIsSubmittingResults(true)

        try {
            const progressUpdates = Array.from(kanjiProgress.values())
                .filter(progress => progress.isCorrect !== null)
                .map(progress => ({
                    kanjiId: progress.kanjiId,
                    isCorrect: progress.isCorrect
                }))

            console.log('Submitting study results:', progressUpdates)

            const response = await ApiService.post(`/deck/${currentDeck.id}/study-complete`, {
                progressUpdates,
                addNewKanji: false,
                autoAddBasedOnProgress: true,
                newKanjiCount: 3,
                masteryThresholdDays: 7,
                masteryCountThreshold: 5
            })

            console.log('Study results submitted successfully:', response.data)

            const result = response.data
            const { progressUpdate, kanjiAddition } = result

            let successMessage = `Progress saved! Accuracy: ${progressUpdate?.accuracyRate || 0}%`

            if (kanjiAddition?.success && kanjiAddition?.totalAdded > 0) {
                successMessage += ` | Added ${kanjiAddition.totalAdded} new kanji automatically! 🎉`
            }

            message.success(successMessage)

        } catch (error) {
            console.error('Failed to submit study results:', error)
            message.error('Failed to save progress. Please try again.')
        } finally {
            setIsSubmittingResults(false)
        }
    }

    const addMoreKanji = async (count = 3) => {
        if (!currentDeck) return

        try {
            message.loading('Adding more kanji to your deck...', 0)

            const response = await ApiService.post(`/deck/${currentDeck.id}/add-random-kanji`, {
                count
            })

            console.log('New kanji added:', response.data)
            message.destroy()
            message.success(`Successfully added ${count} new kanji to your deck! 🎌`)


            setTimeout(() => {
                window.location.reload()
            }, 1500)

        } catch (error) {
            console.error('Failed to add new kanji:', error)
            message.destroy()
            message.error('Failed to add new kanji. Please try again.')
        }
    }

    // Handle study completion
    useEffect(() => {
        if (isStudySessionComplete && !isSubmittingResults) {
            submitStudyResults()
        }
    }, [isStudySessionComplete])

    if (loading || authLoading) {
        return (
            <div className='flex w-[100vw] justify-center'>
                <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
                    <Button onClick={() => navigate('/')} type="default" className="mb-4">
                        ← Back
                    </Button>
                    <div className="text-lg">
                        {authLoading ? 'Setting up your session...' : 'Loading flashcards...'}
                    </div>
                </div>
            </div>
        )
    }

    if (flashcards.length === 0) {
        return (
            <div className='flex w-[100vw] justify-center'>
                <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
                    <Button onClick={() => navigate('/')} type="default" className="mb-4">
                        ← Back
                    </Button>

                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">🎉</div>
                        <div className="text-2xl font-bold text-green-600 mb-2">
                            Great Job!
                        </div>
                        <div className="text-lg text-gray-700 mb-4">
                            You've completed today's kanji study session!
                        </div>
                        <div className="text-sm text-gray-500 mb-6">
                            All scheduled kanji for today have been reviewed. Come back tomorrow for your next session, or add more kanji to continue studying.
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Return to Home
                            </Button>

                            <div className="text-xs text-gray-400 mb-2">Want to study more?</div>

                            <Button
                                size="middle"
                                onClick={() => addMoreKanji(3)}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                Study More (3 more kanjis)
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }



    return (
        <div className='flex w-[100vw] justify-center'>
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
                <Button onClick={() => navigate('/')} type="default" className="mb-4">
                    ← Back
                </Button>

                {isStudySessionComplete && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                        <div className="text-lg font-semibold text-green-800 mb-2">
                            🎉 Deck Completed!
                        </div>
                        <div className="text-sm text-green-700 mb-3">
                            {isSubmittingResults ? 'Saving your progress...' : 'All kanji in this deck have been studied.'}
                        </div>
                        {!isSubmittingResults && (
                            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => navigate('/')}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Return to Home
                                </Button>
                                <span className="text-gray-500">or</span>
                                <Button
                                    size="small"
                                    onClick={() => addMoreKanji(3)}
                                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                >
                                    Study More (3 more kanjis)
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {currentDeck && (
                    <div className="mb-2 text-sm text-gray-600">
                        Deck: {currentDeck.name || 'Your Deck'} | {flashcards.length} total | {activeFlashcards.length} remaining
                        {isAuthenticated && (
                            <span className="ml-2 text-blue-600">
                                {isGuest ? '(Guest)' : username ? `(${username})` : '(Registered User)'}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex justify-center gap-3 mb-4">
                    <Button size='small' onClick={() => setShowKana(p => !p)}>
                        {showKana ? "Hide Kana" : "Show Kana"}
                    </Button>
                    <Button size='small' onClick={() => setShowMeaning(p => !p)}>
                        {showMeaning ? "Hide Translation" : "Show Translation"}
                    </Button>
                </div>

                <Card className="w-full max-w-xl text-center">
                    <div className="text-xs text-gray-400 mb-1">ID: {selectedSentence.id || selectedSentence.kanjiId}</div>
                    <h2 className="text-xl mb-2">Select the correct kanji</h2>
                    <p className="text-2xl mb-2">
                        {selectedSentence.tokenized.map((word, index) => {
                            if (word.surface === selectedSentence.usedKanjiForm) {
                                if (showAnswer && selectedChoice === selectedSentence.usedKanjiForm) {
                                    return (
                                        <Word key={index} word={word} correct={true} />)

                                }

                                return <>⬜</>

                            }
                            return <Word key={index} word={word} />
                        }
                        )}
                    </p>

                    {showKana && <p className="text-gray-500 mb-2"> {selectedSentence.tokenized.map((word) => {
                        return <>{word.kana}</>
                    }
                    )}</p>}
                    {showMeaning && (
                        <p className="text-md italic text-blue-700 mb-2">{selectedSentence.meaning}</p>
                    )}

                    <Radio.Group
                        onChange={(e) => setSelectedChoice(e.target.value)}
                        value={selectedChoice}
                        disabled={showAnswer}
                        className="flex flex-wrap justify-center gap-3 mb-4"
                    >
                        {choices.map((choice) => (
                            <Radio.Button key={choice} value={choice}>
                                {choice}
                            </Radio.Button>
                        ))}
                    </Radio.Group>

                    {showAnswer && (
                        <p className={`text-lg font-semibold ${selectedChoice === selectedSentence.usedKanjiForm ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedChoice === selectedSentence.usedKanjiForm
                                ? '✅ Correct!'
                                : `❌ Incorrect. Correct answer: ${selectedSentence.usedKanjiForm}`}
                        </p>
                    )}

                    <div className="mt-6 flex gap-4 justify-center">
                        {!showAnswer ? (
                            <Button type="primary" onClick={handleSubmit} disabled={isStudySessionComplete}>
                                Submit
                            </Button>
                        ) : isStudySessionComplete ? (
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-3">
                                    No more questions in this deck!
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button type="primary" onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">
                                        Finish & Return Home
                                    </Button>
                                    <div className="text-xs text-gray-500 mb-1">Want to continue studying?</div>
                                    <Button
                                        size="small"
                                        onClick={() => addMoreKanji(3)}
                                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                    >
                                        Study More (3 more kanjis)
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button type="default" onClick={handleNext}>
                                Next
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Flashcard
