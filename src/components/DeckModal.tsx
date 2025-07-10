import { useState } from 'react';
import { Switch, Input, Button, Tabs } from 'antd';

const { TabPane } = Tabs;

const dummyKanjis = [
    { kanji: '私', meaning: "I, my 'self", jlpt: 'N5', kana: 'つい' },
    { kanji: '渡', meaning: 'to cross over', jlpt: 'N4', kana: 'わたし' },
    { kanji: 'わるい', meaning: 'bad; inferior', jlpt: 'N5', kana: 'わる' },
    { kanji: '忘', meaning: 'to forget', jlpt: 'N5', kana: 'ね' },
    { kanji: '分', meaning: 'to understand', jlpt: 'N5', kana: 'いちご' },
    { kanji: '若', meaning: 'young', jlpt: 'N5', kana: 'い' },
];

export default function DeckModal() {
    const [addDaily, setAddDaily] = useState(true);
    //const [studentsCanEdit, setStudentsCanEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredKanjis = dummyKanjis.filter(k =>
        k.kanji.includes(searchTerm) ||
        k.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.kana.includes(searchTerm)
    );

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
            <h2>THIS PAGE IS NOT IMPLEMENTED YET, NOT FUNCTIONAL</h2>
            <h2 className="text-xl font-semibold mb-4">Edit Deck</h2>

            <div className="mb-4 flex items-center justify-between">
                <span>Add new kanji each day</span>
                <Switch checked={addDaily} onChange={setAddDaily} />
            </div>

            <div className="mb-4 flex gap-2 items-center">
                <Input value="https://kanjistudy.com/decks/abc123" readOnly disabled />
                <Button type="default">Copy</Button>
            </div>

            {/*<div className="mb-4 flex items-center justify-between">
                <span>Can students edit kanji</span>
                <Switch checked={studentsCanEdit} onChange={setStudentsCanEdit} />
            </div>*/}

            <Tabs defaultActiveKey="1" className="mb-4">
                <TabPane tab="Current kanjis" key="1">
                    <p className="text-gray-400 italic">List current kanjis here</p>
                </TabPane>
                <TabPane tab="Add new kanjis" key="2">
                    <Input
                        placeholder="Search kanji"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        {filteredKanjis.map((k, idx) => (
                            <div
                                key={idx}
                                className="border border-gray-200 rounded-lg shadow-sm p-3"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-xl font-semibold">{k.kanji}</div>
                                        <div className="text-sm text-gray-500">{k.meaning}</div>
                                        <div className="text-xs text-gray-400 mt-1">JLPT {k.jlpt}</div>
                                        <div className="text-xs text-gray-400">{k.kana}</div>
                                    </div>
                                    <Button type="text" size="small">
                                        Add
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
}
