import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { useRouter } from 'next/navigation';
import { useHistory } from './hooks/useHistory';
import { useClearHistory } from './hooks/useClearHistory';
import { useProfile } from '@/features/home/hooks/useProfile';

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('./hooks/useHistory');
vi.mock('./hooks/useClearHistory');
vi.mock('@/features/home/hooks/useProfile');

vi.mock('@/shared/layouts/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('@/shared/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

describe('HomePage', () => {
  const mockPush = vi.fn();
  const mockClearMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);

    vi.mocked(useClearHistory).mockReturnValue({
      mutate: mockClearMutate,
      isPending: false,
    } as any);

    vi.mocked(useProfile).mockReturnValue({
      data: { name: 'John Doe' },
    } as any);
  });

  const mockUseHistory = (overrides = {}) => {
    const defaultMock = {
      data: { results: [] },
      isLoading: false,
      isError: false,
      ...overrides,
    };
    vi.mocked(useHistory).mockReturnValue(defaultMock as any);
    return defaultMock;
  };

  const setup = () => render(<HomePage />);

  describe('Rendering', () => {
    it('should render the loading state when history is fetching', () => {
      mockUseHistory({ isLoading: true });
      setup();

      expect(screen.queryByLabelText(/search an english word/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('should render welcome message with profile name', () => {
      mockUseHistory();
      setup();

      expect(screen.getByText(/welcome back,/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument();
    });

    it('should fallback to "Reader" if profile name is missing', () => {
      vi.mocked(useProfile).mockReturnValue({ data: null } as any);
      mockUseHistory();
      setup();

      expect(screen.getByRole('heading', { name: 'Reader' })).toBeInTheDocument();
    });

    it('should render empty history state', () => {
      mockUseHistory({ data: { results: [] } });
      setup();

      expect(screen.getByRole('heading', { name: 'No searches yet' })).toBeInTheDocument();
      expect(screen.getByText(/start searching words to build your history/i)).toBeInTheDocument();

      const clearBtn = screen.getByRole('button', { name: /clear history/i });
      expect(clearBtn).toBeDisabled();
    });

    it('should show an error message if history fetching fails', () => {
      mockUseHistory({ isError: true });
      setup();

      expect(screen.getByRole('alert')).toHaveTextContent(/failed to load search history/i);
    });

    it('should render a list of history items', () => {
      mockUseHistory({
        data: {
          results: [
            { word: 'apple', added: '2023-10-01T10:00:00Z' },
            { word: 'banana', added: '2023-10-02T10:00:00Z' },
          ],
        },
      });
      setup();

      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /apple/i })).toHaveAttribute('href', '/word/apple');
    });
  });

  describe('Interactions', () => {
    it('should navigate to the word page on search submit', () => {
      mockUseHistory();
      setup();

      const searchInput = screen.getByLabelText(/search an english word/i);
      const searchButton = screen.getByRole('button', { name: 'Search' });

      fireEvent.change(searchInput, { target: { value: '  hello  ' } });
      fireEvent.click(searchButton);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/word/hello');
    });

    it('should not navigate if the search input is empty', () => {
      mockUseHistory();
      setup();

      const searchButton = screen.getByRole('button', { name: 'Search' });

      fireEvent.click(searchButton);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should call clearHistory mutation when Clear History button is clicked', () => {
      mockUseHistory({
        data: { results: [{ word: 'apple', added: '2023-10-01T10:00:00Z' }] },
      });
      setup();

      const clearBtn = screen.getByRole('button', { name: /clear history/i });

      expect(clearBtn).not.toBeDisabled();
      fireEvent.click(clearBtn);

      expect(mockClearMutate).toHaveBeenCalledTimes(1);
    });
  });
});
