import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SigninPage } from './SigninPage';
import { useSignIn } from '../../hooks/useSignIn';

// Mock hook
vi.mock('../../hooks/useSignIn');

describe('SigninPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUseSignIn = (overrides = {}) => {
    const defaultMock = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
      ...overrides,
    };

    vi.mocked(useSignIn).mockReturnValue(defaultMock as any);
    return defaultMock;
  };

  const setup = (mock = {}) => {
    mockUseSignIn(mock);
    return render(<SigninPage />);
  };

  describe('Rendering', () => {
    it('should render signin form correctly', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();

      expect(screen.getByAltText('Logo')).toBeInTheDocument();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render sign up link with correct href', () => {
      setup();

      const link = screen.getByRole('link', { name: /create one/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/signup');
    });
  });

  describe('Form interaction', () => {
    it('should update inputs and submit form', () => {
      const mutate = vi.fn();
      setup({ mutate });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });

      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: '123456' },
      });

      fireEvent.submit(screen.getByRole('form', { name: 'signin-form' }));

      expect(mutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456',
      });
    });
  });

  describe('States', () => {
    it('should show loading state and disable button', () => {
      setup({ isPending: true });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error message when there is an error', () => {
      setup({ error: { message: 'Invalid credentials' } });

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });
});
