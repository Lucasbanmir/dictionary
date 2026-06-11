import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignupPage } from './SignupPage';
import { useSignUp } from '../../hooks/useSignUp';

// Mock hook
vi.mock('../../hooks/useSignUp');

describe('SignupPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUseSignUp = (overrides = {}) => {
    const defaultMock = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
      ...overrides,
    };

    vi.mocked(useSignUp).mockReturnValue(defaultMock as any);
    return defaultMock;
  };

  const setup = (mock = {}) => {
    mockUseSignUp(mock);
    return render(<SignupPage />);
  };

  describe('Rendering', () => {
    it('should render signup form correctly', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render logo and titles', () => {
      setup();

      expect(screen.getByAltText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Dictionary')).toBeInTheDocument();
      expect(screen.getByText(/create your account and start building your personal dictionary/i)).toBeInTheDocument();
    });

    it('should render sign in link', () => {
      setup();

      const link = screen.getByRole('link', { name: /sign in/i });
      expect(link).toHaveAttribute('href', '/signin');
    });
  });

  describe('Form interactions', () => {
    it('should update input values correctly', () => {
      setup();

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'Lucas' } });
      fireEvent.change(emailInput, { target: { value: 'lucas@email.com' } });
      fireEvent.change(passwordInput, { target: { value: '123456' } });

      expect(nameInput.value).toBe('Lucas');
      expect(emailInput.value).toBe('lucas@email.com');
      expect(passwordInput.value).toBe('123456');
    });

    it('should call mutate on form submit', () => {
      const mutate = vi.fn();
      setup({ mutate });

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Lucas' },
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'lucas@email.com' },
      });

      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: '123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(mutate).toHaveBeenCalledWith({
        name: 'Lucas',
        email: 'lucas@email.com',
        password: '123456',
      });
    });

    it('should prevent default form submission behavior', () => {
      const mutate = vi.fn();
      setup({ mutate });

      const form = screen.getByRole('form', { name: 'signup-form' });

      fireEvent.submit(form);

      expect(mutate).toHaveBeenCalled();
    });
  });

  describe('Hook states', () => {
    it('should show loading state', () => {
      setup({ isPending: true });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading spinner when pending', () => {
      setup({ isPending: true });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error message when mutation fails', () => {
      setup({
        error: { message: 'Something went wrong' },
      });

      expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    });

    it('should not show error when null', () => {
      setup({ error: null });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('UX behavior', () => {
    it('should disable button during loading', () => {
      setup({ isPending: true });

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should enable button when not loading', () => {
      setup({ isPending: false });

      expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled();
    });
  });
});
