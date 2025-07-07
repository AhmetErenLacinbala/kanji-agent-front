import { useEffect, useState } from 'react'
import { Button, Table } from 'antd'
import ApiService, { API_URL } from '../services/api'
import { Kanji } from '../models'
import CreateSentenceModal from './CreateSentenceModal'

const KanjiTable = () => {
    const [kanjiList, setKanjiList] = useState<Kanji[]>([])
    const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null)
    const [modalVisible, setModalVisible] = useState(false)

    const fetchKanjis = async () => {
        console.log("Fetching kanjis", API_URL);
        const response = await ApiService.get(`${API_URL}/kanji`)
        setKanjiList(response.data)
    }

    useEffect(() => {
        fetchKanjis()
    }, [])

    useEffect(() => {
        console.log(kanjiList)
    })

    const columns = [
        {
            title: 'Kanji',
            dataIndex: 'kanji',
            key: 'kanji',
        },
        {
            title: 'Meaning',
            dataIndex: 'meaning',
            key: 'meaning',
        },
        {
            title: 'JLPT',
            dataIndex: 'jlptLevel',
            key: 'jlptLevel',
        },
        {
            title: "Sentence Count",
            dataIndex: "exampleSentences",
            key: 'exampleSentences',
            render: (sentences: any[]) => (
                <span>{sentences?.length}</span>
            ),
        },

        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Kanji) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedKanji(record)
                        setModalVisible(true)
                    }}
                >
                    Add Sentence
                </Button>
            ),
        },
    ]

    return (
        <div className="p-4">
            <Table dataSource={kanjiList} columns={columns} rowKey="id" />
            <CreateSentenceModal
                kanji={selectedKanji}
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false)
                    setSelectedKanji(null)
                }}
            />
        </div>
    )
}

export default KanjiTable
