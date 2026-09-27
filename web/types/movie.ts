export interface Movie {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
}
export interface PagedResponse<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}
