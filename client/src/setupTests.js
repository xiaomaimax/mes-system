/**
 * Jest Setup File for React Testing
 * 
 * This file is automatically loaded by react-scripts before running tests.
 * It sets up the test environment and mocks browser APIs.
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for Ant Design components
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
}

// Mock ResizeObserver for recharts components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
