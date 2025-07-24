import { useState } from 'react'
import { Card, Button, Input, message, Radio } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Sentence } from '../models'
import { getRandomItems } from '../utils/funcs'
import ApiService from '../services/api'
import Word from './Word'

const DebugQuestion = () => {
    const [questionId, setQuestionId] = useState('')
    const [loading, setLoading] = useState(false)
    const [question, setQuestion] = useState<Sentence | null>(null)
    const [selectedChoice, setSelectedChoice] = useState(null)
    const [choices, setChoices] = useState<string[]>([])
    const [showAnswer, setShowAnswer] = useState(false)
    const [showKana, setShowKana] = useState(false)
    const [showMeaning, setShowMeaning] = useState(false)

    const navigate = useNavigate()

    const fetchQuestion = async () => {
        if (!questionId.trim()) {
            message.warning('Please enter a question ID')
            return
        }

        setLoading(true)

        try {
            console.log('🔍 Fetching question:', questionId)
            const response = await ApiService.get(`/kanji/question/${questionId.trim()}`)
            const questionData = response.data

            console.log('✅ Question loaded:', questionData)
            setQuestion(questionData)

            // Generate choices for the question
            const wrongChoices = questionData.whitelist.filter((item: string) => item !== questionData.usedKanjiForm)
            const selectedWrongChoices = getRandomItems(wrongChoices, Math.min(5, wrongChoices.length))
            const allChoices = [...selectedWrongChoices, questionData.usedKanjiForm]
            const shuffledChoices = getRandomItems(allChoices, allChoices.length)

            setChoices(shuffledChoices)
            setSelectedChoice(null)
            setShowAnswer(false)
            setShowKana(false)
            setShowMeaning(false)

            message.success('Question loaded successfully!')

        } catch (error) {
            console.error('❌ Failed to fetch question:', error)
            message.error('Failed to load question. Check the ID and try again.')
            setQuestion(null)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = () => {
        if (!selectedChoice) {
            message.warning('Please select an option first')
            return
        }
        setShowAnswer(true)
    }

    const resetQuestion = () => {
        setQuestion(null)
        setQuestionId('')
        setSelectedChoice(null)
        setChoices([])
        setShowAnswer(false)
        setShowKana(false)
        setShowMeaning(false)
    }

    return (
        <div className='flex w-[100vw] justify-center'>
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
                <Button onClick={() => navigate('/')} type="default" className="mb-4">
                    ← Back to Home
                </Button>

                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">🐛 Debug Question</h1>
                    <p className="text-gray-600">Test specific questions by entering their ID</p>
                </div>

                {/* Question ID Input */}
                <Card className="w-full max-w-lg mb-4">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-700">
                            Question ID:
                        </label>
                        <Input
                            placeholder="Enter question ID (e.g. question-123)"
                            value={questionId}
                            onChange={(e) => setQuestionId(e.target.value)}
                            onPressEnter={fetchQuestion}
                            size="large"
                        />
                        <div className="flex gap-2">
                            <Button
                                type="primary"
                                onClick={fetchQuestion}
                                loading={loading}
                                size="large"
                                className="flex-1"
                            >
                                Load Question
                            </Button>
                            {question && (
                                <Button
                                    onClick={resetQuestion}
                                    size="large"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Question Display */}
                {question && (
                    <>
                        <div className="flex justify-center gap-3 mb-4">
                            <Button size='small' onClick={() => setShowKana(p => !p)}>
                                {showKana ? "Hide Kana" : "Show Kana"}
                            </Button>
                            <Button size='small' onClick={() => setShowMeaning(p => !p)}>
                                {showMeaning ? "Hide Translation" : "Show Translation"}
                            </Button>
                        </div>

                        <Card className="w-full max-w-xl text-center">
                            <div className="text-xs text-gray-400 mb-1">
                                Debug ID: {question.id || question.kanjiId}
                            </div>
                            <h2 className="text-xl mb-2">Select the correct kanji</h2>
                            <p className="text-2xl mb-2">
                                {question.tokenized.map((word, index) => {
                                    if (word.surface === question.usedKanjiForm) {
                                        if (showAnswer && selectedChoice === question.usedKanjiForm) {
                                            return (
                                                <Word key={index} word={word} correct={true} />
                                            )
                                        }
                                        return <span key={index}>⬜</span>
                                    }
                                    return <Word key={index} word={word} />
                                })}
                            </p>

                            {showKana && (
                                <p className="text-gray-500 mb-2">
                                    {question.tokenized.map((word, index) => (
                                        <span key={index}>{word.kana}</span>
                                    ))}
                                </p>
                            )}

                            {showMeaning && (
                                <p className="text-md italic text-blue-700 mb-2">
                                    {question.meaning}
                                </p>
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
                                <p className={`text-lg font-semibold ${selectedChoice === question.usedKanjiForm ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedChoice === question.usedKanjiForm
                                        ? '✅ Correct!'
                                        : `❌ Incorrect. Correct answer: ${question.usedKanjiForm}`}
                                </p>
                            )}

                            <div className="mt-6 flex gap-4 justify-center">
                                {!showAnswer ? (
                                    <Button type="primary" onClick={handleSubmit}>
                                        Submit
                                    </Button>
                                ) : (
                                    <Button type="default" onClick={resetQuestion}>
                                        Test Another Question
                                    </Button>
                                )}
                            </div>

                            {/* Debug Info */}
                            <div className="mt-4 p-3 bg-gray-50 rounded text-left text-xs">
                                <div className="font-semibold text-gray-700 mb-2">Debug Info:</div>
                                <div><strong>ID:</strong> {question.id}</div>
                                <div><strong>Kanji ID:</strong> {question.kanjiId}</div>
                                <div><strong>Correct Answer:</strong> {question.usedKanjiForm}</div>
                                <div><strong>Whitelist:</strong> {question.whitelist.join(', ')}</div>
                                <div><strong>Sentence:</strong> {question.sentence}</div>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}

export default DebugQuestion 