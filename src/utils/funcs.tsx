export function getRandomItems(arr: any[], count: number): any[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

type Segment = {
    text: string;
    isKanjis: boolean;
    kanji?: string;
};

export function analyzeSurfaceKanaAlignment(surface: string, kana: string): Segment[] {
    const isKanji = (char: string): boolean => /[\u4E00-\u9FFF]/.test(char);

    let gap = 0;
    const kanaIndex: number[] = [];
    for (let i = 0; i < surface.length; i++) {
        if (isKanji(surface[i])) {
            gap++;
        } else {
            kanaIndex.push(i);
        }
    }

    const selection = surface.length - gap;

    function findOrderedCombinations(str: string, k: number): string[][] {
        const result: string[][] = [];
        function backtrack(start: number, path: string[]) {
            if (path.length === k) {
                result.push([...path]);
                return;
            }
            for (let i = start; i < str.length; i++) {
                path.push(str[i]);
                backtrack(i + 1, path);
                path.pop();
            }
        }
        backtrack(0, []);
        return result;
    }

    function generatePositionedCombinations(chars: string[], totalLength: number): (string | null)[][] {
        const results: (string | null)[][] = [];
        function backtrack(path: (string | null)[], charIndex: number, startIndex: number) {
            if (charIndex === chars.length) {
                results.push([...path]);
                return;
            }
            for (let i = startIndex; i <= totalLength - (chars.length - charIndex); i++) {
                const newPath = [...path];
                newPath[i] = chars[charIndex];
                backtrack(newPath, charIndex + 1, i + 1);
            }
        }
        const initial = Array<string | null>(totalLength).fill(null);
        backtrack(initial, 0, 0);
        return results;
    }

    const kanaCombinations = findOrderedCombinations(kana, selection);
    const finalResults = kanaCombinations.flatMap(comb =>
        generatePositionedCombinations(comb, surface.length)
    );

    let selectedOrder: number | null = null;
    for (let i = 0; i < finalResults.length; i++) {
        let flag = true;
        for (let j = 0; j < kanaIndex.length; j++) {
            if (finalResults[i][kanaIndex[j]] !== surface[kanaIndex[j]]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            selectedOrder = i;
            break;
        }
    }

    if (selectedOrder === null) {
        return [];
    }

    function combineNulls(array: (string | null)[]): (string | null)[] {
        const result: (string | null)[] = [];
        let previousWasNull = false;
        for (const item of array) {
            if (item === null) {
                if (!previousWasNull) {
                    result.push(null);
                    previousWasNull = true;
                }
            } else {
                result.push(item);
                previousWasNull = false;
            }
        }
        return result;
    }

    function groupByNulls(array: (string | null)[]): (string[] | [null])[] {
        const result: (string[] | [null])[] = [];
        let currentGroup: string[] = [];
        for (const item of array) {
            if (item === null) {
                if (currentGroup.length > 0) {
                    result.push([currentGroup.join('')]);
                    currentGroup = [];
                }
                result.push([null]);
            } else {
                currentGroup.push(item);
            }
        }
        if (currentGroup.length > 0) {
            result.push([currentGroup.join('')]);
        }
        return result;
    }

    const singleNullResult = combineNulls(finalResults[selectedOrder]);
    const surfaceGroups = groupByNulls(singleNullResult);

    let matchedKana = '';
    for (const group of surfaceGroups) {
        if (group[0] !== null) {
            matchedKana += group[0];
        }
    }

    let remainingKana = kana;
    for (const char of matchedKana) {
        remainingKana = remainingKana.replace(char, '');
    }

    let kanaCursor = 0;
    const enriched: Segment[] = [];

    let surfaceCursor = 0;
    for (const group of surfaceGroups) {
        if (group[0] === null) {
            const reading = remainingKana.slice(kanaCursor, kanaCursor + 3);
            kanaCursor += reading.length;

            // Extract Kanji string from surface
            let kanjiStr = '';
            while (surfaceCursor < surface.length && kanjiStr.length < reading.length) {
                const char = surface[surfaceCursor];
                if (isKanji(char)) {
                    kanjiStr += char;
                }
                surfaceCursor++;
            }

            enriched.push({ text: reading, isKanjis: true, kanji: kanjiStr });
        } else {
            enriched.push({ text: group[0], isKanjis: false });
            surfaceCursor += group[0].length;
        }
    }

    return enriched;
}


export const getDeviceId = (): string => {
    const storedDeviceId = localStorage.getItem('deviceId');
    if (storedDeviceId) {
        return storedDeviceId;
    }

    // Generate a new device ID using crypto.randomUUID() if available, fallback to timestamp + random
    const deviceId = crypto.randomUUID ? crypto.randomUUID() : `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('deviceId', deviceId);
    return deviceId;
};
