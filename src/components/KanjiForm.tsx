import { useState } from 'react'
import { Input, Button, InputNumber, message } from 'antd'
import ApiService, { API_URL } from '../services/api'
import { CreateKanjiDto } from '../models'


const KanjiForm = () => {
    const [form, setForm] = useState<CreateKanjiDto>({
        kanji: '',
        meaning: '',
        kana: '',
        kanjiPoint: 0,
        jlptLevel: 5,
    })

    const handleChange = (field: string, value: string | number) => {
        setForm({ ...form, [field]: value })
    }

    const handleSubmit = async () => {
        try {
            const payload = {
                ...form,
                kana: form.kana.split(/[、, ]/).map((k) => k.trim()).filter(Boolean),
            }

            await ApiService.post(`${API_URL}/kanji`, payload)
            console.log(payload)
            message.success('Kanji saved successfully!')
            setForm({ kanji: '', meaning: '', kana: '', kanjiPoint: 0, jlptLevel: 5 })
        } catch (error) {
            message.error('Failed to save kanji');
        }
    }

    return (
        <div className="p-4 max-w-md mx-auto space-y-4 bg-white rounded-xl shadow-md">
            <div className='flex'>


                <Input
                    placeholder="Kanji"
                    value={form.kanji}
                    onChange={(e) => handleChange('kanji', e.target.value)}
                />
            </div>
            <div className='flex'>


                <Input
                    placeholder="Meaning"
                    value={form.meaning}
                    onChange={(e) => handleChange('meaning', e.target.value)}
                />
            </div>
            <Input
                placeholder="Kana (comma or space separated)"
                value={form.kana}
                onChange={(e) => handleChange('kana', e.target.value)}
            />
            <div className='flex align-middle justify-between gap-2'>

                <h3 className=" font-light text-left text-sm m-auto text-black">JLPT Score: </h3>
                <InputNumber
                    className=""
                    min={1}
                    max={5}
                    value={form.jlptLevel}
                    onChange={(val) => handleChange('jlptLevel', val ?? 5)}
                    placeholder="JLPT Level"
                />
            </div>
            <Button type="primary" className="w-full" onClick={handleSubmit}>
                Save Kanji
            </Button>
        </div>
    )
}

export default KanjiForm
