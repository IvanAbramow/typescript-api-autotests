import { SUB_SUITES, SUITES, setTestInfo, TAGS, TITLES } from '@packages/allure';
import { expect, test } from '../../fixtures';
import { HTTPUnauthorizedError, ZOD_SCHEMAS } from '../../schemas/generated';
import { ETestTypes } from '../../types';

test.describe(
  TITLES.API,
  setTestInfo({
    suite: SUITES.API.V1,
    subSuite: SUB_SUITES.USERS,
    tags: [TAGS.users],
  }),
  () => {
    test(`with unauthorized user ${ETestTypes.NEGATIVE}`, async ({ usersClient }) => {
      const { body, status } = await usersClient.getMeRequest<HTTPUnauthorizedError>();

      await expect.soft(status).toHaveStatusCode(401);
      await expect(body).toMatchZodSchema(ZOD_SCHEMAS.HTTPUnauthorizedError);

      expect(body.detail).toBe('Not authenticated');
    });
  },
);
