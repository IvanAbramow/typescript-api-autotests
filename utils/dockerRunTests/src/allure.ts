import { log, removeDir, sleep } from '@packages/utils';
import { spawn } from 'child_process';
import { access, constants } from 'fs/promises';

/**
 * Поллинг allure-results папки в проекте
 * @returns {Promise<void>}
 * @example
 * await pollingAllureResultsFolder()
 */
const pollingAllureResultsFolder = async (): Promise<void> => {
  const maxRetries = 10;
  const delay = 3000;

  let attempts: number = 0;

  log.info('Waiting for allure-results folder...');

  while (attempts < maxRetries) {
    try {
      await access('allure-results', constants.R_OK);

      log.node('Found allure-results folder');
      break;
    } catch (error) {
      attempts++;
      log.info(`Error ${error}. No allure-results folder. Try again ${attempts}/${maxRetries}`);

      await sleep(delay);
    }
  }

  if (attempts >= maxRetries) {
    throw new Error('Number of attempts to wait for allure-results folder has been exceeded');
  }
};

/**
 * Запуск команды через spawn
 */
const runCommand = (command: string, args: string[] = []): Promise<{ success: boolean; error?: Error }> => {
  return new Promise((resolve) => {
    const childProcess = spawn(command, args, {
      shell: true,
      stdio: 'inherit',
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({
          error: new Error(`Command failed with exit code ${code}`),
          success: false,
        });
      }
    });

    childProcess.on('error', (error) => {
      resolve({ error, success: false });
    });
  });
};

/**
 * Генерация Allure отчёта
 * @returns {Promise<void>}
 */
const generateAllureReport = async (): Promise<void> => {
  log.node('Generate allure-report');

  const result = await runCommand('bunx', ['allure', 'generate', 'allure-results']);

  if (!result.success) {
    throw new Error(`Failed to generate allure report: ${result.error?.message}`);
  }
};

/**
 * Открытие Allure отчёта в браузере
 * @returns {Promise<void>}
 */
const openAllureReport = async (): Promise<void> => {
  log.node('Open in browser allure-report');

  return new Promise<void>((resolve, reject) => {
    const allureProcess = spawn('bunx', ['allure', 'open'], {
      shell: true,
      stdio: 'inherit',
    });

    const timeout = setTimeout(() => {
      allureProcess.kill();
      log.info('Stop allure server after 10s');
      resolve();
    }, 10000);

    allureProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 || code === null) {
        resolve();
      } else {
        reject(new Error(`Allure process exited with code ${code}`));
      }
    });

    allureProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
};

/**
 * Генерирует и открывает Allure‑отчёт.
 * Выполняет: npx allure generate allure-results && npx allure open
 * @param shouldOpenAllure - флаг, указывающий, нужно ли открывать отчёт
 * @returns {Promise<void>}
 * @example
 * await generateAndOpenAllureReport(true)
 */
export const generateAndOpenAllureReport = async (shouldOpenAllure: boolean): Promise<void> => {
  if (shouldOpenAllure) {
    await pollingAllureResultsFolder();

    await generateAllureReport();
    await openAllureReport();
  }
};

/**
 * Удаляет все Allure артефакты.
 * Выполняет: rm -rf allure-report allure-result .allure
 * @returns {Promise<void>}
 * @example
 * await clearAllureArtifacts()
 */
export const clearAllureArtifacts = async (): Promise<void> => {
  try {
    log.node('Deleting allure artifacts');

    removeDir('./allure-report');
    removeDir('./allure-results');
    removeDir('./.allure');

    log.info('Allure artifacts successfully deleted');
  } catch (error) {
    log.warning("Can't delete allure artifacts", error);
  }
};
