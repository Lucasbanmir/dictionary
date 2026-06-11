import { PaginatedResponse } from '@/shared/types/types';

export type WordListResponse = PaginatedResponse<string>;

export type Phonetic = {
  text?: string;
  audio?: string;
};

export type Definition = {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
};

export type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
};

export type WordDetails = {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings?: Meaning[];
  sourceUrls?: string[];
};
