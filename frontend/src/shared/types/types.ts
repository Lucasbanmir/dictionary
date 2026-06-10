
export type UserWord = {
  word: string;
  added: string;
};

export type PageParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  results: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
