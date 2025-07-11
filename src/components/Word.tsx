import React from 'react';
import { WordType } from '../models';
import { analyzeSurfaceKanaAlignment } from '../utils/funcs';

const Word: React.FC<{ word: WordType, correct?: boolean }> = ({ word, correct }) => {
    const segments = analyzeSurfaceKanaAlignment(word.surface, word.kana);

    return (
        <>
            {segments.map((seg, idx) =>
                seg.isKanjis ? (
                    <ruby className={correct ? " text-green-500" : ""} key={idx}>
                        {seg.kanji}
                        <rt>{seg.text}</rt>
                    </ruby>
                ) : (
                    <React.Fragment key={idx}>{seg.text}</React.Fragment>
                )
            )}
        </>
    );
};

export default Word;
