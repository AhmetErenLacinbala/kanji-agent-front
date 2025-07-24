export interface Kanji {
  id: string;
  kanji: string;
  meaning: string;
  kana: string[];
  kanjiPoint: number;
  jlptLevel: number;
  exampleSentences: Sentence[];
}

export interface CreateKanjiDto {
  kanji: string
  meaning: string
  kana: string
  kanjiPoint: number
  jlptLevel: number
}

export interface Sentence {
  id: string,
  sentence: string;
  meaning: string;
  kana: string;
  usedKanjiForm: string;
  kanjiId: string;
  whitelist: string[];
  tokenized: WordType[]
}

export type WordType = {
  surface: string
  kana: string
  pos: string
}

export interface FlashcardModel {
  deckId?: string,
  kanjiId?: string,
  id?: string,
  kanji: Kanji
}

export interface Deck {
  id: string
  name?: string
  isAnonymous: boolean
}

export interface DeckServiceResult {
  deck: Deck
  flashcards: FlashcardModel[]
}