import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouterInstanceConfig } from './router-instance-config';

describe('Router Remount Configuration', () => {
  let mockComponent: any;

  beforeEach(() => {
    mockComponent = vi.fn();
  });

  it('should create RouterInstanceConfig with renavigation enabled by default', () => {
    const config = new RouterInstanceConfig({
      id: 'test-router',
      routes: [
        {
          path: '/test',
          component: mockComponent
        }
      ]
    });

    expect(config.renavigation).toBeUndefined();
  });

  it('should create RouterInstanceConfig with renavigation explicitly disabled', () => {
    const config = new RouterInstanceConfig({
      id: 'test-router',
      renavigation: false,
      routes: [
        {
          path: '/test',
          component: mockComponent
        }
      ]
    });

    expect(config.renavigation).toBe(false);
  });

  it('should create RouterInstanceConfig with renavigation explicitly enabled', () => {
    const config = new RouterInstanceConfig({
      id: 'test-router',
      renavigation: true,
      routes: [
        {
          path: '/test',
          component: mockComponent
        }
      ]
    });

    expect(config.renavigation).toBe(true);
  });

  it('should preserve renavigation setting in constructor', () => {
    const configDisabled = new RouterInstanceConfig({
      id: 'test-router',
      renavigation: false,
      routes: [
        {
          path: '/test',
          component: mockComponent
        }
      ]
    });

    const configEnabled = new RouterInstanceConfig({
      id: 'test-router',
      renavigation: true,
      routes: [
        {
          path: '/test',
          component: mockComponent
        }
      ]
    });

    expect(configDisabled.renavigation).toBe(false);
    expect(configEnabled.renavigation).toBe(true);
  });

  it('should handle multiple routes with renavigation configuration', () => {
    const config = new RouterInstanceConfig({
      id: 'test-router',
      renavigation: true,
      routes: [
        {
          path: '/test',
          component: mockComponent
        },
        {
          path: '/other',
          component: mockComponent
        }
      ]
    });

    expect(config.renavigation).toBe(true);
    expect(config.routes).toHaveLength(2);
  });
});
