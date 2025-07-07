import { useEffect, useState } from 'react'
import { Button, Table, Input, Select, Space } from 'antd'
import ApiService, { API_URL } from '../services/api'
import { Kanji } from '../models'
import CreateSentenceModal from './CreateSentenceModal'

const { Search } = Input
const { Option } = Select

interface PaginationData {
    from: number
    take: number
    total: number
    hasMore: boolean
}

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

const KanjiTable = () => {
    const [kanjiList, setKanjiList] = useState<Kanji[]>([])
    const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [jlptLevel, setJlptLevel] = useState<string | undefined>(undefined)
    const [pagination, setPagination] = useState<PaginationData>({
        from: 0,
        take: 200,
        total: 0,
        hasMore: false
    })

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const fetchKanjis = async (from = 0, take = 200, query = '', jlpt?: string) => {
        try {
            let url = `${API_URL}/kanji/paginated?from=${from}&take=${take}`
            if (query) {
                url += `&query=${encodeURIComponent(query)}`
            }
            if (jlpt) {
                url += `&jlptLevel=${jlpt}`
            }

            console.log('Fetching with URL:', url) // Debug log
            const response = await ApiService.get(url)
            setKanjiList(response.data.data)
            setPagination(response.data.pagination)
            console.log('Pagination response:', response.data.pagination)

        } catch (error) {
            console.error('Failed to fetch kanjis:', error)
        }
    }

    useEffect(() => {
        console.log('useEffect triggered - debouncedSearchQuery:', debouncedSearchQuery, 'jlptLevel:', jlptLevel)
        fetchKanjis(0, pagination.take, debouncedSearchQuery, jlptLevel)
    }, [debouncedSearchQuery, jlptLevel, pagination.take])

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
            title: "Kana",
            dataIndex: "kana",
            key: 'kana',
            render: (kana: any[]) => (
                kana.map((kanae: any, index: number) => (
                    <span key={index}>
                        {kanae}{index < kana.length - 1 ? ', ' : ''}
                    </span>
                ))
            ),
        },

        /*{
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
        },*/
    ]

    const handleTableChange = (page: number, pageSize?: number) => {
        const from = (page - 1) * (pageSize || pagination.take)
        const take = pageSize || pagination.take
        fetchKanjis(from, take, debouncedSearchQuery, jlptLevel)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleJlptChange = (value: string | undefined) => {
        setJlptLevel(value)
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <Space direction="horizontal" size="large">
                    <Input
                        placeholder="Search kanji (e.g., 雨, あめ or rain)"
                        allowClear
                        size="large"
                        onChange={handleSearchChange}
                        value={searchQuery}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="Filter by JLPT level"
                        style={{ width: 200 }}
                        onChange={handleJlptChange}
                        allowClear
                        value={jlptLevel}
                    >
                        <Option value="N5">N5</Option>
                        <Option value="N4">N4</Option>
                        <Option value="N3">N3</Option>
                        <Option value="N2">N2</Option>
                        <Option value="N1">N1</Option>
                    </Select>
                </Space>
            </div>
            <Table
                dataSource={kanjiList}
                columns={columns}
                rowKey="id"
                pagination={{
                    current: Math.floor(pagination.from / pagination.take) + 1,
                    pageSize: pagination.take,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    onChange: handleTableChange,
                    onShowSizeChange: handleTableChange,
                }}
            />
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
