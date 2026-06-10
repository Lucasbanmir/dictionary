export const queryKeys = {
  profile: ['profile'] as const,
  history: (page = 1) => ['history', page] as const,
  favorites: (page = 1) => ['favorites', page] as const,
  words: (search: string, page: number) => ['words', search, page] as const,
  details: (word: string) => ['word-details', word] as const,
};