// biome-ignore-all lint/suspicious/noExplicitAny: no types

import { expect as baseExpect, test as baseTest, mergeExpects, mergeTests } from '@playwright/test';
import { ZodSchema, z } from 'zod';
import { UsersClient } from '../clients/v1/Users';
import { expect as commonExpect, test as commonTest } from './base';

type HttpClients = {
  usersClient: UsersClient;
};

const validateZodSchema = async <T>({
  schema,
  data,
}: {
  schema: ZodSchema<T>;
  data: unknown;
}): Promise<{
  success: boolean;
  error?: string;
  data?: T;
}> => {
  try {
    const validatedData = await schema.parseAsync(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Zod validation failed:\n${error}`,
      };
    }
    return {
      success: false,
      error: `Unknown error: ${error}`,
    };
  }
};

const apiTest = baseTest.extend<HttpClients>({
  usersClient: async ({ request }, use) => {
    await use(new UsersClient(request));
  },
});

const apiExpect = baseExpect.extend({
  async toHaveStatusCode(expectedStatus: number, responseStatus: number) {
    return baseTest.step(`Expect response status code to be ${expectedStatus}`, async () => {
      const pass = responseStatus === expectedStatus;

      return {
        message: () =>
          pass
            ? 'Статус код соответствует ожидаемому'
            : `Статус код не соответствует ожидаемому. Полученный статус код: ${responseStatus}`,
        pass,
        name: 'toHaveStatusCode',
      };
    });
  },

  async toMatchZodSchema(responseBody: unknown, expectedSchema: ZodSchema<any>) {
    return baseTest.step('Expect response body to match zod schema', async () => {
      const validation = await validateZodSchema({ schema: expectedSchema, data: responseBody });
      const pass = validation.success;

      return {
        message: () => (pass ? 'Schema validation passed' : `${validation.error}`),
        pass,
        name: 'toMatchZodSchema',
      };
    });
  },
});

export const test = mergeTests(apiTest, commonTest);
export const expect = mergeExpects(apiExpect, commonExpect);
