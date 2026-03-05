import { test as baseTest, mergeTests } from '@playwright/test';

import { test as commonTest } from './base';

type HttpClients = {};

const apiTest = baseTest.extend<HttpClients>({});

export const test = mergeTests(apiTest, commonTest);
