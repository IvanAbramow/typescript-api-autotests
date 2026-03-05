import { PlaywrightTestConfig, PlaywrightTestOptions, PlaywrightWorkerOptions } from '@playwright/test';

const isCI = process.env.CI;

const testsOptions: Partial<PlaywrightTestOptions & PlaywrightWorkerOptions> = {
  actionTimeout: 10_000,
  ignoreHTTPSErrors: true,
  navigationTimeout: 10_000,
  screenshot: { fullPage: true, mode: 'on' },
  serviceWorkers: 'block',
  userAgent: 'Web-Playwright-Framework',
  video: 'retain-on-failure',
};

const allureReporterOptions: {
  environmentInfo: {
    OS: string;
    NODE_VERSION: string;
  };
  detail: boolean;
  suiteTitle: boolean;
} = {
  detail: false,
  environmentInfo: {
    NODE_VERSION: process.version,
    OS: process.platform,
  },
  suiteTitle: false,
};

const CONFIG: PlaywrightTestConfig = {
  expect: {
    timeout: 10_000,
  },
  forbidOnly: !!isCI,
  outputDir: '../allure-results',
  projects: [
    {
      name: 'api',
    },
  ],
  quiet: !!isCI,
  reporter: isCI
    ? [['allure-playwright', allureReporterOptions], ['dot']]
    : [['allure-playwright', allureReporterOptions]],
  retries: isCI ? 1 : 0,
  testDir: './',
  use: testsOptions,
  workers: isCI ? 20 : 1,
};

export default CONFIG;
