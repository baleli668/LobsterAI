import { describe, expect, test } from 'vitest';

import {
  BrowserNetworkMode,
  BrowserProfileMode,
  normalizeBrowserCdpUrl,
  normalizeBrowserHostnameList,
  normalizeBrowserWebAccessConfig,
} from './constants';

describe('browser web access constants', () => {
  test('normalizes hostname lists from URLs and host entries', () => {
    expect(normalizeBrowserHostnameList([
      ' https://Example.com/docs ',
      'example.com:443',
      '*.Internal.local/path',
      '',
      'https://Example.com/other',
    ])).toEqual(['example.com', '*.internal.local']);
  });

  test('accepts only HTTP and WebSocket CDP URLs', () => {
    expect(normalizeBrowserCdpUrl('http://127.0.0.1:9222')).toBe('http://127.0.0.1:9222');
    expect(normalizeBrowserCdpUrl('wss://browser.example.com')).toBe('wss://browser.example.com');
    expect(normalizeBrowserCdpUrl('file:///tmp/browser')).toBeUndefined();
    expect(normalizeBrowserCdpUrl('127.0.0.1:9222')).toBeUndefined();
  });

  test('normalizes browser web access config values', () => {
    const config = normalizeBrowserWebAccessConfig({
      browserEnabled: false,
      profileMode: BrowserProfileMode.User,
      networkMode: BrowserNetworkMode.Strict,
      allowedHostnames: ['https://Localhost:8443/a'],
      blockedHostnames: ['tracking.example/path'],
      cdpUrl: 'ftp://browser.example.com',
      remoteCdpTimeoutMs: -1,
      webFetch: {
        enabled: false,
        followGlobalProxy: false,
        timeoutSeconds: 30,
        readability: false,
      },
    });

    expect(config.browserEnabled).toBe(false);
    expect(config.profileMode).toBe(BrowserProfileMode.User);
    expect(config.networkMode).toBe(BrowserNetworkMode.Strict);
    expect(config.allowedHostnames).toEqual(['localhost']);
    expect(config.blockedHostnames).toEqual(['tracking.example']);
    expect(config.cdpUrl).toBeUndefined();
    expect(config.remoteCdpTimeoutMs).toBeUndefined();
    expect(config.webFetch).toMatchObject({
      enabled: false,
      followGlobalProxy: false,
      timeoutSeconds: 30,
      readability: false,
    });
  });
});
