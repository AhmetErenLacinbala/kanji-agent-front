import { useState } from 'react'
import { Modal, Input, Button, message } from 'antd'
import ApiService, { API_URL } from '../services/api'
import { Kanji } from '../models'

interface Props {
    kanji: Kanji | null
    visible: boolean
    onClose: () => void
}

const CreateSentenceModal = ({ kanji, visible, onClose }: Props) => {
    const [form, setForm] = useState({
        sentence: '',
        meaning: '',
        kana: '',
        usedKanjiForm: '',
    })

    const handleSubmit = async () => {
        if (!kanji) return

        try {
            await ApiService.post(`${API_URL}/sentence`, {
                ...form,
                kanjiId: kanji.id,
            })
            message.success('Sentence added!')
            setForm({ sentence: '', meaning: '', kana: '', usedKanjiForm: '' })
            onClose()
        } catch {
            message.error('Failed to save sentence')
        }
    }

    return (
        <Modal
            title={`Add Sentence for ${kanji?.kanji}`}
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <div className="space-y-3">
                <Input
                    placeholder="Japanese Sentence"
                    value={form.sentence}
                    onChange={(e) => setForm({ ...form, sentence: e.target.value })}
                />
                <Input
                    placeholder="Meaning"
                    value={form.meaning}
                    onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                />
                <Input
                    placeholder="Kana"
                    value={form.kana}
                    onChange={(e) => setForm({ ...form, kana: e.target.value })}
                />
                <Input
                    placeholder="Correct Answer"
                    value={form.usedKanjiForm}
                    onChange={(e) => setForm({ ...form, usedKanjiForm: e.target.value })}
                />
                <Button type="primary" className="w-full" onClick={handleSubmit}>
                    Submit
                </Button>
            </div>
        </Modal>
    )
}

export default CreateSentenceModal
