import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoritesPage } from './FavoritesPage';
import { useFavorites } from './hooks/useFavorites';
import { useFavoriteActions } from './hooks/useFavoritesActions';

// Mocks
vi.mock('./hooks/useFavorites');
vi.mock('./hooks/useFavoritesActions');

vi.mock('@/shared/components/ConfirmDialog', () => ({
  ConfirmDialog: ({ open, title, onConfirm, onClose }: any) => {
    if (!open) return null;
    return (
      <div data-testid="mock-confirm-dialog" role="dialog">
        <h2>{title}</h2>
        <button onClick={onConfirm} data-testid="dialog-confirm-btn">
          Confirmar
        </button>
        <button onClick={onClose} data-testid="dialog-cancel-btn">
          Cancelar
        </button>
      </div>
    );
  },
}));

describe('FavoritesPage', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFavoriteActions).mockReturnValue({
      unfavorite: { mutate: mockMutate, isPending: false },
    } as any);
  });

  const mockUseFavorites = (overrides = {}) => {
    const defaultMock = {
      data: null,
      isLoading: false,
      isError: false,
      ...overrides,
    };
    vi.mocked(useFavorites).mockReturnValue(defaultMock as any);
    return defaultMock;
  };

  const setup = () => render(<FavoritesPage />);

  describe('Rendering', () => {
    it('should render the page title correctly', () => {
      mockUseFavorites();
      setup();

      expect(screen.getByRole('heading', { name: 'Favorite Words' })).toBeInTheDocument();
    });

    it('should display empty state when there are no favorites', () => {
      mockUseFavorites({
        data: { totalDocs: 0, results: [] },
      });
      setup();

      expect(screen.getByText(/0 saved words/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'No favorite words yet' })).toBeInTheDocument();
      expect(screen.getByText(/start exploring the dictionary/i)).toBeInTheDocument();
    });

    it('should show an error message when data fetching fails', () => {
      mockUseFavorites({ isError: true });
      setup();

      expect(screen.getByRole('alert')).toHaveTextContent(/failed to load favorites/i);
    });

    it('should render a list of favorite words', () => {
      mockUseFavorites({
        data: {
          totalDocs: 2,
          results: [
            { word: 'apple', added: '2023-10-01T10:00:00Z' },
            { word: 'banana', added: '2023-10-02T10:00:00Z' },
          ],
        },
      });
      setup();

      expect(screen.getByText(/2 saved words/i)).toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();

      expect(screen.getByRole('link', { name: /apple/i })).toHaveAttribute('href', '/word/apple');
    });
  });

  describe('Interactions', () => {
    it('should open the confirm dialog when the remove button is clicked', () => {
      mockUseFavorites({
        data: {
          totalDocs: 1,
          results: [{ word: 'apple', added: '2023-10-01T10:00:00Z' }],
        },
      });
      setup();

      const removeButtons = screen.getAllByRole('button');
      fireEvent.click(removeButtons[0]);

      expect(screen.getByTestId('mock-confirm-dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Remove favorite' })).toBeInTheDocument();
    });

    it('should call unfavorite mutation when confirming removal', () => {
      mockUseFavorites({
        data: {
          totalDocs: 1,
          results: [{ word: 'apple', added: '2023-10-01T10:00:00Z' }],
        },
      });
      setup();

      const removeButtons = screen.getAllByRole('button');
      fireEvent.click(removeButtons[0]);

      fireEvent.click(screen.getByTestId('dialog-confirm-btn'));

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith('apple');

      expect(screen.queryByTestId('mock-confirm-dialog')).not.toBeInTheDocument();
    });

    it('should close the dialog without calling mutation if canceled', () => {
      mockUseFavorites({
        data: {
          totalDocs: 1,
          results: [{ word: 'apple', added: '2023-10-01T10:00:00Z' }],
        },
      });
      setup();

      const removeButtons = screen.getAllByRole('button');
      fireEvent.click(removeButtons[0]);

      fireEvent.click(screen.getByTestId('dialog-cancel-btn'));

      expect(mockMutate).not.toHaveBeenCalled();

      expect(screen.queryByTestId('mock-confirm-dialog')).not.toBeInTheDocument();
    });
  });
});
