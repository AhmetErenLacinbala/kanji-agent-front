import { useEffect, useState } from 'react'
import { Card, Button, Radio, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import ApiService, { API_URL } from '../services/api'
import { Kanji, Sentence } from '../models'
import { getRandomItems } from '../utils/funcs'

const Flashcard = () => {
    const [kanjis, setKanjis] = useState<Kanji[]>([])
    const [selectedSentence, setSelectedSentence] = useState<Sentence>({
        id: "",
        sentence: "",
        meaning: "",
        kana: "",
        usedKanjiForm: "",
        kanjiId: "",
        whitelist: [],
    })
    const [selectedChoice, setSelectedChoice] = useState(null)
    const [choices, setChoices] = useState<string[]>([])
    const [showAnswer, setShowAnswer] = useState(false)
    const [showMeaning, setShowMeaning] = useState(false)
    const [showKana, setShowKana] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchKanjis = async () => {
            try {
                const response = await ApiService.get(`${API_URL}/kanji/paginated?from=0&take=50
`)
                setKanjis(response.data.data)
            } catch (error) {
                console.error('Failed to fetch kanjis:', error)
            }
        }

        fetchKanjis()
    }, [])

    useEffect(() => {

        if (kanjis.length > 0) {
            generateQuestion()
            console.log(kanjis.length)
        }
    }, [kanjis])

    const generateQuestion = () => {

        const randomKanji = kanjis[Math.floor(Math.random() * kanjis.length)]

        const sentence = getRandomItems(randomKanji.exampleSentences, 1)[0]
        setSelectedSentence(sentence)
        let choices = getRandomItems(sentence.whitelist, 5);
        choices = getRandomItems([...choices, sentence.usedKanjiForm], 6)


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

    return (
        <div className='flex w-[100vw] justify-center'>


            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">

                <Button onClick={() => navigate('/')} type="default" className="mb-4">
                    ← Back
                </Button>
                <div className="flex justify-center gap-3 mb-4">
                    <Button size='small' onClick={() => setShowKana(p => !p)}>{showKana ? "Hide Kana" : "Show Kana"}</Button>
                    <Button size='small' onClick={() => setShowMeaning(p => !p)}>{showMeaning ? "Hide Translation" : "Show Translation"}</Button>
                </div>
                {selectedSentence ? (
                    <Card className="w-full max-w-xl text-center">
                        <h2 className="text-xl mb-2">Select the correct kanji</h2>
                        <p className="text-2xl mb-2">
                            {selectedSentence.sentence.replace(selectedSentence.usedKanjiForm, '⬜')}
                        </p>

                        {showKana && <p className="text-gray-500 mb-2">{selectedSentence.kana}</p>}
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
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    )
}

export default Flashcard
