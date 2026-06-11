import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DictionaryPage } from './DictionaryPage';
import { useWords } from '../word/hooks/useWords';
import { useWordDetails } from '../word/hooks/useWordDetails';

// Mocks
vi.mock('../word/hooks/useWords');
vi.mock('../word/hooks/useWordDetails');

vi.mock('./components/WordCard', () => ({
  WordCard: ({ word, onClick }: any) => (
    <button onClick={onClick} data-testid={`word-card-${word}`}>
      {word}
    </button>
  ),
}));

vi.mock('@/features/word/components/WordDetailsView', () => ({
  WordDetailsView: () => <div data-testid="word-details-view">Mocked Details</div>,
}));

describe('DictionaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUseWords = (overrides = {}) => {
    const defaultMock = {
      data: null,
      isLoading: false,
      isError: false,
      ...overrides,
    };
    vi.mocked(useWords).mockReturnValue(defaultMock as any);
    return defaultMock;
  };

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

  const setup = () => {
    return render(<DictionaryPage />);
  };

  describe('Rendering', () => {
    it('should render page titles and search input', () => {
      mockUseWords();
      mockUseWordDetails();
      setup();

      expect(screen.getByRole('heading', { name: 'Dictionary' })).toBeInTheDocument();
      expect(screen.getByText(/explore thousands of english words/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/search an english word/i)).toBeInTheDocument();
    });
  });

  describe('Words List States', () => {
    it('should show error alert when words fetch fails', () => {
      mockUseWords({ isError: true });
      mockUseWordDetails();
      setup();

      expect(screen.getByRole('alert')).toHaveTextContent(/failed to load dictionary/i);
    });

    it('should render word cards when data is loaded', () => {
      mockUseWords({
        data: { results: ['apple', 'banana'], totalPages: 1 },
      });
      mockUseWordDetails();
      setup();

      expect(screen.getByTestId('word-card-apple')).toBeInTheDocument();
      expect(screen.getByTestId('word-card-banana')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should update search and reset page on input change', () => {
      mockUseWords();
      mockUseWordDetails();
      setup();

      const searchInput = screen.getByLabelText(/search an english word/i);

      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(useWords).toHaveBeenLastCalledWith('test', 1);
    });

    it('should change page when pagination is clicked', () => {
      mockUseWords({
        data: { results: ['apple'], totalPages: 5 },
      });
      mockUseWordDetails();
      setup();

      const page2Button = screen.getByRole('button', { name: /go to page 2/i });
      fireEvent.click(page2Button);

      expect(useWords).toHaveBeenLastCalledWith('', 2);
    });
  });

  describe('Word Details Dialog', () => {
    it('should open dialog and load details when a word is clicked', () => {
      mockUseWords({
        data: { Glen: null, results: ['apple'], totalPages: 1 },
      });
      mockUseWordDetails({
        isLoading: true,
      });
      setup();

      fireEvent.click(screen.getByTestId('word-card-apple'));

      expect(screen.getByRole('heading', { name: /apple/i })).toBeInTheDocument();

      expect(screen.getByText(/loading details/i)).toBeInTheDocument();

      const openNewTabLink = screen.getByRole('link', { name: /open word in new tab/i });
      expect(openNewTabLink).toHaveAttribute('href', '/word/apple');
    });

    it('should show error in dialog if word details fail', () => {
      mockUseWords({
        data: { results: ['apple'], totalPages: 1 },
      });
      mockUseWordDetails({
        isError: true,
      });
      setup();

      fireEvent.click(screen.getByTestId('word-card-apple'));

      expect(screen.getByRole('alert')).toHaveTextContent(/no definitions found/i);
    });

    it('should render WordDetailsView in dialog when data is loaded', () => {
      mockUseWords({
        data: { results: ['apple'], totalPages: 1 },
      });
      mockUseWordDetails({
        data: { word: 'apple', phonetic: '/æp.əl/' },
      });
      setup();

      fireEvent.click(screen.getByTestId('word-card-apple'));

      expect(screen.getByTestId('word-details-view')).toBeInTheDocument();
    });
  });
});
