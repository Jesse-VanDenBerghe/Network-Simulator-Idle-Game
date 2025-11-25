// Test setup file
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Mock Vue global
global.Vue = {
  createApp: vi.fn(),
  ref: vi.fn(),
  reactive: vi.fn(),
  computed: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  watch: vi.fn(),
  nextTick: vi.fn()
};

// Suppress Vue warnings in tests
config.global.config.warnHandler = () => null;
