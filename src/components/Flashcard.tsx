import { useEffect, useState } from 'react'
import { Card, Button, Radio, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Sentence, Deck, FlashcardModel } from '../models'
import { getRandomItems } from '../utils/funcs'
import { createDeck } from '../services/deckService'
import Word from './Word'



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

    const navigate = useNavigate()

    useEffect(() => {
        const initializeDeck = async () => {
            try {
                setLoading(true)
                console.log('Creating/fetching deck for flashcards...')
                const { deck, flashcards: deckFlashcards } = await createDeck()

                console.log('Deck loaded:', deck)
                console.log('Flashcards loaded:', deckFlashcards)

                setCurrentDeck(deck)
                setFlashcards(deckFlashcards)
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
        if (flashcards.length > 0) {
            generateQuestion()
            console.log('Total flashcards available:', flashcards.length)
        }
    }, [flashcards])

    const generateQuestion = () => {
        if (flashcards.length === 0) return

        const randomFlashcard: FlashcardModel = flashcards[Math.floor(Math.random() * flashcards.length)]
        const randomKanji: Sentence = randomFlashcard.kanji.exampleSentences[0]
        console.log('Selected flashcard:', randomFlashcard)

        setSelectedSentence(randomKanji)
        console.log("randomFlashcard", randomFlashcard);
        let choices = getRandomItems(randomKanji.whitelist, 5);
        choices = getRandomItems([...choices, randomKanji.usedKanjiForm], 6)

        setChoices(choices)
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
        setShowAnswer(true)
    }

    const handleNext = () => {
        generateQuestion()
    }

    if (loading) {
        return (
            <div className='flex w-[100vw] justify-center'>
                <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
                    <Button onClick={() => navigate('/')} type="default" className="mb-4">
                        ← Back
                    </Button>
                    <div className="text-lg">Loading flashcards...</div>
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
                    <div className="text-lg">No flashcards available. Please try again later.</div>
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

                {currentDeck && (
                    <div className="mb-2 text-sm text-gray-600">
                        Deck: {currentDeck.name || 'Anonymous Deck'} | {flashcards.length} flashcards
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
                    <h2 className="text-xl mb-2">Select the correct kanji</h2>
                    <p className="text-2xl mb-2">
                        {selectedSentence.tokenized.map((word, index) => {
                            if (word.surface === selectedSentence.usedKanjiForm) {
                                if (showAnswer && selectedChoice === selectedSentence.usedKanjiForm) {
                                    return (
                                        <ruby key={index}>
                                            <p className=' text-green-500'>{word.surface}</p>
                                            <rt>{word.kana === word.surface ? "" : word.kana}</rt>
                                        </ruby>)

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
                            <Button type="primary" onClick={handleSubmit}>
                                Submit
                            </Button>
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
