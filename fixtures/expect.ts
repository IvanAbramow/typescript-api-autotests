import { expect as baseExpect, mergeExpects } from '@playwright/test';

import { expect as commonExpect } from './base';

const apiExpect = baseExpect.extend({});

export const expect = mergeExpects(apiExpect, commonExpect);
