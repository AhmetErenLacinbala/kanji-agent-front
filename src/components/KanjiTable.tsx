import { useEffect, useState } from 'react'
import { Table, Input, Select, Space } from 'antd'
import { Kanji } from '../models'
import CreateSentenceModal from './CreateSentenceModal'
import { useKanjiSearch } from '../hooks/useKanjiSearch'

const { Option } = Select

const KanjiTable = () => {
    const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null)
    const [modalVisible, setModalVisible] = useState(false)

    const {
        kanjiList,
        pagination,
        loading,
        searchQuery,
        jlptLevel,
        handleSearchChange,
        handleJlptChange,
        handleTableChange
    } = useKanjiSearch({ initialPageSize: 200 })

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
    ]

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
                loading={loading}
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
