import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

vi.mock('react-transition-group', () => ({
  TransitionGroup: ({ children }: any) => children,
  CSSTransition: ({ children }: any) => children,
  Transition: ({ children }: any) => children,
}));

afterEach(() => {
  cleanup();
});

global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: any, options?: any) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as any;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
