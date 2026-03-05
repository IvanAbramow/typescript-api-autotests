import { log } from '@packages/utils';
import enquirer from 'enquirer';

const defaultTestPath = 'tests';

/**
 * Запрашивает у пользователя:
 * 1. Путь к тестам
 * 2. Сгенерировать и открыть в браузере Allure‑отчёт
 * @returns {Promise<{testPath: string, shouldOpenAllure: boolean, useCache: boolean }>}
 * @example
 * const { testPath, shouldOpenAllure } = await getTestParamsAndAllureChoices(); // Вернёт объект с заполненными пользователем значениями
 */
export const getTestParamsAndAllureChoices = async (): Promise<{
  testPath: string;
  useCache: boolean;
  shouldOpenAllure: boolean;
}> => {
  try {
    const { prompt } = enquirer;

    const useCaches = await prompt<{ useCache: 'true' | 'false' }>([
      {
        choices: [
          {
            name: 'true',
            message: 'Да',
            value: 'true',
          },
          { name: 'false', message: 'Нет', value: 'false' },
        ],
        message: 'Использовать кэшированный docker image для playwright?',
        name: 'useCache',
        type: 'select',
      },
    ]);

    const testPathResult = await prompt<{ testPath: string }>([
      {
        message: 'Указать путь к папке (или файлу) с тестами для запуска (Enter = tests): ?',
        name: 'testPath',
        type: 'input',
      },
    ]);

    const shouldOpenAllures = await prompt<{ shouldOpenAllure: 'true' | 'false' }>([
      {
        choices: [
          { name: 'true', message: 'Да', value: 'true' },
          { name: 'false', message: 'Нет', value: 'false' },
        ],
        message: 'Сгенерировать и открыть Allure-отчёт после прогона тестов?',
        name: 'shouldOpenAllure',
        type: 'select',
      },
    ]);

    return {
      shouldOpenAllure: shouldOpenAllures.shouldOpenAllure === 'true',
      testPath: testPathResult.testPath ?? defaultTestPath,
      useCache: useCaches.useCache === 'true',
    };
  } catch (error) {
    log.error(error);

    return {
      shouldOpenAllure: false,
      testPath: defaultTestPath,
      useCache: false,
    };
  }
};
