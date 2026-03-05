// biome-ignore-all lint:suspicious/noExplicitAny: no playwright types
import { expect as baseExpect, test as baseTest, TestInfo } from '@playwright/test';
import {
  description as setDescription,
  displayName as setDisplayName,
  parentSuite as setParentSuite,
  subSuite as setSubSuite,
  suite as setSuite,
  tags as setTags,
} from 'allure-js-commons';

type BaseFixtures = {
  /** Функция заполнения аллюр-нотаций для отчёта */
  autoFillAllureNotations: void;
  fillAllureDescription: (description: string) => Promise<void>;
};

const fillAllureNotations = async (testInfo: TestInfo) => {
  const { tags, annotations, titlePath, title, project } = testInfo;
  const { type, description } = annotations[0] || {};

  await Promise.all([
    // вторым элементом в массиве идет заголовок из test.describe
    setParentSuite(titlePath[1]),
    description ? setSuite(description) : Promise.resolve(),
    type ? setSubSuite(type) : Promise.resolve(),
    tags && tags.length > 0 ? setTags(...tags) : Promise.resolve(),
    setDisplayName(`[${project.name}]: ${title}`),
  ]);
};

export const test = baseTest.extend<BaseFixtures>({
  autoFillAllureNotations: [
    async ({}, use, testInfo) => {
      await fillAllureNotations(testInfo);
      await use();
    },
    { auto: true },
  ],
  fillAllureDescription: async ({}, use) => {
    await use(async (description) => {
      await setDescription(description);
    });
  },
});

export const expect = baseExpect.extend({
  /**
   * @remarks
   * Кастомный Playwright matcher проверяет существование элемента
   *
   * @param {number | string} value - Проверяемое значение
   * @returns {Promise<{pass: boolean, message: () => string}>}
   *
   * @example
   * expect(value).toBeDefinedWithMessage();
   *
   * @see {@link baseExpect.toBeDefined} Оригинальная документация Playwright
   */
  toBeDefinedWithMessage(value: any): Promise<{ pass: boolean; message: () => string }> {
    return baseTest.step(`Expect value ${value.toString()} toBeDefined`, () => {
      const matcherName = 'toBeDefinedWithMessage';

      let pass: boolean;
      let matcherResult: any;

      try {
        const expectation = this.isNot
          ? // eslint-disable-next-line playwright/valid-expect
            baseExpect(value).not
          : // eslint-disable-next-line playwright/valid-expect
            baseExpect(value);
        expectation.toBeDefined();
        pass = true;
      } catch (error: any) {
        matcherResult = error.matcherResult;
        pass = false;
      }

      if (this.isNot) {
        pass = !pass;
      }

      const message = () =>
        `Ожидали, что ${value.toString()} ${pass ? 'НЕ ' : ' '}является undefined` +
        `\n\n ${this.utils.printReceived(matcherResult.message)}`;

      return {
        actual: matcherResult?.actual,
        message,
        name: matcherName,
        pass,
      };
    });
  },
  /**
   * @remarks
   * Кастомный Playwright matcher проверяет что элемента является undefined
   *
   * @param {number | string} value - Проверяемое значение
   * @returns {Promise<{pass: boolean, message: () => string}>}
   *
   * @example
   * expect(value).toBeUndefinedWithMessage();
   *
   * @see {@link baseExpect.toBeUndefined} Оригинальная документация Playwright
   */
  toBeUndefinedWithMessage(value: any): Promise<{ pass: boolean; message: () => string }> {
    return baseTest.step(`Expect value ${value.toString()} toBeUndefined`, () => {
      const matcherName = 'toBeUndefinedWithMessage';

      let pass: boolean;
      let matcherResult: any;

      try {
        const expectation = this.isNot
          ? // eslint-disable-next-line playwright/valid-expect
            baseExpect(value).not
          : // eslint-disable-next-line playwright/valid-expect
            baseExpect(value);
        expectation.toBeUndefined();
        pass = true;
      } catch (error: any) {
        matcherResult = error.matcherResult;
        pass = false;
      }

      if (this.isNot) {
        pass = !pass;
      }

      const message = () =>
        `Ожидали, что ${value.toString()} ${pass ? ' ' : 'НЕ '}является undefined` +
        `\n\n ${this.utils.printReceived(matcherResult.message)}`;

      return {
        actual: matcherResult?.actual,
        message,
        name: matcherName,
        pass,
      };
    });
  },
  /**
   * @remarks
   * Кастомный Playwright matcher проверяет равенство значений с дополнительным сообщением в шаге
   *
   * @param {number | string} actual - Фактическое значение
   * @param {number | string} expected - Ожидаемое значение
   * @returns {Promise<{pass: boolean, message: () => string}>}
   *
   * @example
   * expect(5).toBeWithMessage(5);
   * expect('hello').toBeWithMessage('hello');
   *
   * @see {@link baseExpect.toBe} Оригинальная документация Playwright
   */
  toBeWithMessage(
    actual: number | string,
    expected: number | string,
  ): Promise<{ pass: boolean; message: () => string }> {
    return baseTest.step(`Expect actual: ${actual} toBe expected: ${expected}`, () => {
      const matcherName = 'toBeWithMessage';

      let pass: boolean;
      let matcherResult: any;

      try {
        const expectation = this.isNot
          ? // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual).not
          : // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual);
        expectation.toBe(expected);
        pass = true;
      } catch (error: any) {
        matcherResult = error.matcherResult;
        pass = false;
      }

      if (this.isNot) {
        pass = !pass;
      }

      const message = () =>
        `${this.isNot ? 'C' : 'НЕ с'}овпали значения \n\n` +
        this.utils.printDiffOrStringify(expected, actual, 'Ожидали', 'Получили', true);

      return {
        actual: matcherResult?.actual,
        expected,
        message,
        name: matcherName,
        pass,
      };
    });
  },
  toContainWithMessage(actual: unknown, expected: unknown): Promise<{ pass: boolean; message: () => string }> {
    return baseTest.step(`Expect actual: ${actual} toContain expected: ${expected}`, () => {
      const matcherName = 'toContainWithMessage';

      let pass: boolean;
      let matcherResult: any;

      try {
        const expectation = this.isNot
          ? // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual).not
          : // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual);
        expectation.toContain(expected);
        pass = true;
      } catch (error: any) {
        matcherResult = error.matcherResult;
        pass = false;
      }

      if (this.isNot) {
        pass = !pass;
      }

      const message = () =>
        `${this.isNot ? 'C' : 'НЕ с'}овпало вхождение \n\n` +
        this.utils.printDiffOrStringify(expected, actual, 'Ожидали', 'Получили', true);

      return {
        actual: matcherResult?.actual,
        expected,
        message,
        name: matcherName,
        pass,
      };
    });
  },
  toEqualWithMessage(actual: unknown, expected: unknown): Promise<{ pass: boolean; message: () => string }> {
    return baseTest.step(`Expect actual: ${actual} toEqual expected: ${expected}`, () => {
      const matcherName = 'toEqualWithMessage';

      let pass: boolean;
      let matcherResult: any;

      try {
        const expectation = this.isNot
          ? // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual).not
          : // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual);
        expectation.toEqual(expected);
        pass = true;
      } catch (error: any) {
        matcherResult = error.matcherResult;
        pass = false;
      }

      if (this.isNot) {
        pass = !pass;
      }

      const message = () =>
        `${this.isNot ? 'C' : 'НЕ с'}овпали значения \n\n` +
        this.utils.printDiffOrStringify(expected, actual, 'Ожидали', 'Получили', true);

      return {
        actual: matcherResult?.actual,
        expected,
        message,
        name: matcherName,
        pass,
      };
    });
  },
  toHaveLengthWithMessage(
    actual: Array<any> | undefined,
    expected: number,
  ): Promise<{ pass: boolean; message: () => string }> {
    return baseTest.step(`Expect ${actual?.length} toHaveLength expected: ${expected}`, () => {
      const matcherName = 'toHaveLengthWithMessage';

      let pass: boolean;
      let matcherResult: any;

      try {
        const expectation = this.isNot
          ? // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual).not
          : // eslint-disable-next-line playwright/valid-expect
            baseExpect(actual);
        expectation.toHaveLength(expected);
        pass = true;
      } catch (error: any) {
        matcherResult = error.matcherResult;
        pass = false;
      }

      if (this.isNot) {
        pass = !pass;
      }

      const message = () =>
        `Ожидали ${pass ? 'НЕ ' : ' '}совпадения по длинам` + `\n\n ${this.utils.printReceived(matcherResult.message)}`;

      return {
        actual: matcherResult?.actual,
        expected,
        message,
        name: matcherName,
        pass,
      };
    });
  },
  /**
   * @remarks
   * Кастомный Playwright matcher проверяет равенство значений с дополнительным сообщением в шаге
   *
   * @param value - Сравниваемое значение
   * @param {RegExp | string} expected - Ожидаемое значение
   * @returns {Promise<{pass: boolean, message: () => string}>}
   *
   * @example
   * const value = 'Is 42 enough?';
   * expect(value).toMatch(/Is \d+ enough/);
   *
   * @see {@link baseExpect.toBe} Оригинальная документация Playwright
   */
  toMatchWithMessage(value: any, expected: RegExp | string): Promise<{ pass: boolean; message: () => string }> {
    return baseTest.step(`Expect value ${value.toString()} toMatch expected ${expected}`, () => {
      const matcherName = 'toMatchWithMessage';

      let pass: boolean;
      let matcherResult: any;

      try {
        const expectation = this.isNot
          ? // eslint-disable-next-line playwright/valid-expect
            baseExpect(value).not
          : // eslint-disable-next-line playwright/valid-expect
            baseExpect(value);
        expectation.toMatch(expected);
        pass = true;
      } catch (error: any) {
        matcherResult = error.matcherResult;
        pass = false;
      }

      if (this.isNot) {
        pass = !pass;
      }

      const message = () =>
        `Ожидали, что ${value.toString()} ${pass ? 'НЕ ' : ' '}содержит ${expected}` +
        `\n\n ${this.utils.printReceived(matcherResult.message)}`;

      return {
        actual: matcherResult?.actual,
        expected,
        message,
        name: matcherName,
        pass,
      };
    });
  },
});
