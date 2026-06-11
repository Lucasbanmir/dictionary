import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WordPage } from './WordPage';
import { useWordDetails } from './hooks/useWordDetails';
import { useFavorites } from '../favorites/hooks/useFavorites';
import { useFavoriteActions } from '../favorites/hooks/useFavoritesActions';

// Mocks
vi.mock('./hooks/useWordDetails', () => ({
  useWordDetails: vi.fn(),
}));

vi.mock('../favorites/hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}));

vi.mock('../favorites/hooks/useFavoritesActions', () => ({
  useFavoriteActions: vi.fn(),
}));

vi.mock('@/features/word/components/WordDetailsView', () => ({
  WordDetailsView: ({ details, isFavorite, isToggling, onToggleFavorite }: any) => (
    <div data-testid="mock-word-details-view">
      <h1>{details.word}</h1>
      <span data-testid="fav-status">{isFavorite ? 'Favorited' : 'Not Favorited'}</span>
      <span data-testid="toggle-status">{isToggling ? 'Toggling' : 'Idle'}</span>
      <button data-testid="toggle-btn" onClick={onToggleFavorite}>
        Toggle Favorite Button
      </button>
    </div>
  ),
}));

describe('WordPage', () => {
  const mockFavoriteMutate = vi.fn();
  const mockUnfavoriteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFavoriteActions).mockReturnValue({
      favorite: { mutate: mockFavoriteMutate, isPending: false, isError: false },
      unfavorite: { mutate: mockUnfavoriteMutate, isPending: false, isError: false },
    } as any);

    vi.mocked(useFavorites).mockReturnValue({
      data: { results: [] },
      isLoading: false,
      isError: false,
    } as any);
  });

  const mockUseWordDetails = (overrides = {}) => {
    const defaultMock = {
      data: null,
      isLoading: false,
      isError: false,
      ...overrides,
    };
    vi.mocked(useWordDetails).mockReturnValue(defaultMock as any);
    return defaultMock;
  };

  const setup = (word = 'apple') => render(<WordPage word={word} />);

  describe('Rendering States', () => {
    it('should show spinner and message when loading word details', () => {
      mockUseWordDetails({ isLoading: true });
      setup();

      expect(screen.getByText(/loading word details\.\.\./i)).toBeInTheDocument();
      expect(screen.queryByTestId('mock-word-details-view')).not.toBeInTheDocument();
    });

    it('should show error alert when word details fetch fails', () => {
      mockUseWordDetails({ isError: true });
      setup('banana');

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Failed to load details for "banana".');
    });

    it('should show alert when favoriting or unfavoriting mutations throw an error', () => {
      mockUseWordDetails({ data: { word: 'apple' } });

      vi.mocked(useFavoriteActions).mockReturnValue({
        favorite: { mutate: mockFavoriteMutate, isPending: false, isError: true },
        unfavorite: { mutate: mockUnfavoriteMutate, isPending: false, isError: false },
      } as any);

      setup();

      expect(screen.getByRole('alert')).toHaveTextContent(/failed to update favorites/i);
    });

    it('should render WordDetailsView when data is loaded successfully', () => {
      mockUseWordDetails({ data: { word: 'apple' } });
      setup();

      expect(screen.getByTestId('mock-word-details-view')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'apple' })).toBeInTheDocument();
    });
  });

  describe('Favorite Business Logic', () => {
    it('should correctly identify if the word is NOT favorited', () => {
      mockUseWordDetails({ data: { word: 'apple' } });
      vi.mocked(useFavorites).mockReturnValue({
        data: { results: [{ word: 'banana' }, { word: 'grape' }] },
      } as any);

      setup('apple');

      expect(screen.getByTestId('fav-status')).toHaveTextContent('Not Favorited');
    });

    it('should identify a word as favorite using case-insensitive check', () => {
      mockUseWordDetails({ data: { word: 'Apple' } });

      vi.mocked(useFavorites).mockReturnValue({
        data: { results: [{ word: 'apple' }] },
      } as any);

      setup('Apple');

      expect(screen.getByTestId('fav-status')).toHaveTextContent('Favorited');
    });

    it('should propagate isToggling true when any mutation is pending', () => {
      mockUseWordDetails({ data: { word: 'apple' } });
      vi.mocked(useFavoriteActions).mockReturnValue({
        favorite: { mutate: mockFavoriteMutate, isPending: true, isError: false },
        unfavorite: { mutate: mockUnfavoriteMutate, isPending: false, isError: false },
      } as any);

      setup();

      expect(screen.getByTestId('toggle-status')).toHaveTextContent('Toggling');
    });
  });

  describe('Interactions', () => {
    it('should call favorite mutation if the word is not currently favorited', () => {
      mockUseWordDetails({ data: { word: 'apple' } });
      vi.mocked(useFavorites).mockReturnValue({ data: { results: [] } } as any);
      setup('apple');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(mockFavoriteMutate).toHaveBeenCalledTimes(1);
      expect(mockFavoriteMutate).toHaveBeenCalledWith('apple');
      expect(mockUnfavoriteMutate).not.toHaveBeenCalled();
    });

    it('should call unfavorite mutation if the word is already favorited', () => {
      mockUseWordDetails({ data: { word: 'apple' } });
      vi.mocked(useFavorites).mockReturnValue({
        data: { results: [{ word: 'apple' }] },
      } as any);
      setup('apple');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(mockUnfavoriteMutate).toHaveBeenCalledTimes(1);
      expect(mockUnfavoriteMutate).toHaveBeenCalledWith('apple');
      expect(mockFavoriteMutate).not.toHaveBeenCalled();
    });
  });
});
