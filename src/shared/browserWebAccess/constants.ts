export const BrowserProfileMode = {
  Managed: 'managed',
  User: 'user',
  Custom: 'custom',
} as const;

export type BrowserProfileMode = typeof BrowserProfileMode[keyof typeof BrowserProfileMode];

export const BrowserRuntimeProfile = {
  Managed: 'openclaw',
  User: 'user',
} as const;

export type BrowserRuntimeProfile = typeof BrowserRuntimeProfile[keyof typeof BrowserRuntimeProfile];

export const BrowserNetworkMode = {
  ProxyCompatible: 'proxy-compatible',
  Strict: 'strict',
} as const;

export type BrowserNetworkMode = typeof BrowserNetworkMode[keyof typeof BrowserNetworkMode];

export const BrowserSnapshotMode = {
  Default: 'default',
  Efficient: 'efficient',
} as const;

export type BrowserSnapshotMode = typeof BrowserSnapshotMode[keyof typeof BrowserSnapshotMode];

export const BrowserDiagnosticStep = {
  GatewayStatus: 'gateway-status',
  Profiles: 'profiles',
  BrowserStatus: 'browser-status',
  BrowserStart: 'browser-start',
  OpenTestPage: 'open-test-page',
} as const;

export type BrowserDiagnosticStep = typeof BrowserDiagnosticStep[keyof typeof BrowserDiagnosticStep];

export const BrowserDiagnosticStatus = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const;

export type BrowserDiagnosticStatus = typeof BrowserDiagnosticStatus[keyof typeof BrowserDiagnosticStatus];

export const BrowserIpc = {
  GetStatus: 'openclaw:browser:getStatus',
  ListProfiles: 'openclaw:browser:listProfiles',
  Test: 'openclaw:browser:test',
  ResetProfile: 'openclaw:browser:resetProfile',
} as const;

export type BrowserIpc = typeof BrowserIpc[keyof typeof BrowserIpc];

export interface BrowserWebFetchConfig {
  enabled: boolean;
  followGlobalProxy: boolean;
  timeoutSeconds?: number;
  maxRedirects?: number;
  maxChars?: number;
  userAgent?: string;
  readability: boolean;
  allowRfc2544BenchmarkRange?: boolean;
}

export interface BrowserWebAccessConfig {
  browserEnabled: boolean;
  profileMode: BrowserProfileMode;
  networkMode: BrowserNetworkMode;
  followGlobalProxy: boolean;
  allowedHostnames: string[];
  blockedHostnames: string[];
  snapshotMode: BrowserSnapshotMode;
  evaluateEnabled: boolean;
  executablePath?: string;
  cdpUrl?: string;
  headless?: boolean;
  attachOnly?: boolean;
  remoteCdpTimeoutMs?: number;
  remoteCdpHandshakeTimeoutMs?: number;
  extraArgs?: string[];
  webFetch: BrowserWebFetchConfig;
}

export interface BrowserDiagnosticResultStep {
  step: BrowserDiagnosticStep;
  status: BrowserDiagnosticStatus;
  message: string;
  details?: string;
}

export interface BrowserDiagnosticResult {
  success: boolean;
  steps: BrowserDiagnosticResultStep[];
  error?: string;
}

export const defaultBrowserWebAccessConfig: BrowserWebAccessConfig = {
  browserEnabled: true,
  profileMode: BrowserProfileMode.Managed,
  networkMode: BrowserNetworkMode.ProxyCompatible,
  followGlobalProxy: true,
  allowedHostnames: [],
  blockedHostnames: [],
  snapshotMode: BrowserSnapshotMode.Efficient,
  evaluateEnabled: true,
  webFetch: {
    enabled: true,
    followGlobalProxy: true,
    readability: true,
  },
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
};

const normalizeOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  return value > 0 ? value : undefined;
};

export const normalizeBrowserStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(new Set(
    value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean),
  ));
};

const stripHostnameDecorations = (value: string): string => {
  const withoutProtocol = value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const withoutPath = withoutProtocol.split(/[/?#]/, 1)[0] ?? '';
  if (withoutPath.startsWith('[')) {
    return withoutPath.replace(/^\[/, '').replace(/\].*$/, '');
  }
  return withoutPath.replace(/:\d+$/, '');
};

export const normalizeBrowserHostnameList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(new Set(
    value
      .filter((item): item is string => typeof item === 'string')
      .map(item => stripHostnameDecorations(item.trim()).toLowerCase())
      .filter(Boolean),
  ));
};

export const normalizeBrowserCdpUrl = (value: unknown): string | undefined => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    return undefined;
  }
  try {
    const parsed = new URL(normalized);
    return ['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol) ? normalized : undefined;
  } catch {
    return undefined;
  }
};

export const normalizeBrowserWebAccessConfig = (
  value: Partial<BrowserWebAccessConfig> | undefined | null,
): BrowserWebAccessConfig => {
  const webFetch: Partial<BrowserWebFetchConfig> = value?.webFetch ?? {};
  const profileMode = Object.values(BrowserProfileMode).includes(value?.profileMode as BrowserProfileMode)
    ? value?.profileMode as BrowserProfileMode
    : defaultBrowserWebAccessConfig.profileMode;
  const networkMode = Object.values(BrowserNetworkMode).includes(value?.networkMode as BrowserNetworkMode)
    ? value?.networkMode as BrowserNetworkMode
    : defaultBrowserWebAccessConfig.networkMode;
  const snapshotMode = Object.values(BrowserSnapshotMode).includes(value?.snapshotMode as BrowserSnapshotMode)
    ? value?.snapshotMode as BrowserSnapshotMode
    : defaultBrowserWebAccessConfig.snapshotMode;
  const executablePath = normalizeOptionalString(value?.executablePath);
  const cdpUrl = normalizeBrowserCdpUrl(value?.cdpUrl);
  const remoteCdpTimeoutMs = normalizeOptionalNumber(value?.remoteCdpTimeoutMs);
  const remoteCdpHandshakeTimeoutMs = normalizeOptionalNumber(value?.remoteCdpHandshakeTimeoutMs);
  const extraArgs = normalizeBrowserStringList(value?.extraArgs);
  const timeoutSeconds = normalizeOptionalNumber(webFetch.timeoutSeconds);
  const maxRedirects = normalizeOptionalNumber(webFetch.maxRedirects);
  const maxChars = normalizeOptionalNumber(webFetch.maxChars);
  const userAgent = normalizeOptionalString(webFetch.userAgent);

  return {
    browserEnabled: value?.browserEnabled ?? defaultBrowserWebAccessConfig.browserEnabled,
    profileMode,
    networkMode,
    followGlobalProxy: value?.followGlobalProxy ?? defaultBrowserWebAccessConfig.followGlobalProxy,
    allowedHostnames: normalizeBrowserHostnameList(value?.allowedHostnames),
    blockedHostnames: normalizeBrowserHostnameList(value?.blockedHostnames),
    snapshotMode,
    evaluateEnabled: value?.evaluateEnabled ?? defaultBrowserWebAccessConfig.evaluateEnabled,
    ...(executablePath ? { executablePath } : {}),
    ...(cdpUrl ? { cdpUrl } : {}),
    ...(value?.headless === true ? { headless: true } : {}),
    ...(value?.attachOnly === true ? { attachOnly: true } : {}),
    ...(remoteCdpTimeoutMs ? { remoteCdpTimeoutMs } : {}),
    ...(remoteCdpHandshakeTimeoutMs ? { remoteCdpHandshakeTimeoutMs } : {}),
    ...(extraArgs.length ? { extraArgs } : {}),
    webFetch: {
      enabled: webFetch.enabled ?? defaultBrowserWebAccessConfig.webFetch.enabled,
      followGlobalProxy: webFetch.followGlobalProxy ?? defaultBrowserWebAccessConfig.webFetch.followGlobalProxy,
      ...(timeoutSeconds ? { timeoutSeconds } : {}),
      ...(maxRedirects ? { maxRedirects } : {}),
      ...(maxChars ? { maxChars } : {}),
      ...(userAgent ? { userAgent } : {}),
      readability: webFetch.readability ?? defaultBrowserWebAccessConfig.webFetch.readability,
      ...(webFetch.allowRfc2544BenchmarkRange === true ? { allowRfc2544BenchmarkRange: true } : {}),
    },
  };
};
