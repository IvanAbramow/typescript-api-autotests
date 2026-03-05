import { log } from '@packages/utils';
import { copyFileSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const npmrcFileName: string = '.npmrc';
const npmrcTempFileName: string = '.npmrc_temp';

/**
 * Создаёт временный файл .npmrc_temp, копируя содержимое оригинального .npmrc из домашней директории пользователя.
 *
 * @throws {Error} Может выбросить ошибку, если:
 * - оригинальный файл .npmrc отсутствует в домашней директории;
 * - возникли проблемы с правами доступа при копировании;
 * - не удалось определить домашнюю директорию пользователя.
 *
 * @example
 * createNpmrcTempFile(); // Создаст .npmrc_temp в текущей рабочей директории
 */
export const createNpmrcTempFile = (): void => {
  log.node('Create temp .npmrc file');

  let userHomeDir: string;

  if (process.env.OS === 'Windows_NT') {
    userHomeDir = join('C:\\Users', process.env.USERNAME as string);
  } else {
    userHomeDir = process.env.HOME || homedir();
  }

  copyFileSync(join(userHomeDir, npmrcFileName), npmrcTempFileName);
};

/**
 * Удаляет временный файл .npmrc_temp, созданный функцией createNpmrcTempFile.
 *
 * @throws {Error} Может выбросить ошибку, если:
 * - файл .npmrc_temp отсутствует;
 * - возникли проблемы с правами доступа при удалении.
 *
 * @example
 * removeNpmrcTempFile(); // Удалит .npmrc_temp из текущей рабочей директории
 */
export const removeNpmrcTempFile = (): void => {
  log.node('Remove temp .npmrc file');

  unlinkSync(npmrcTempFileName);
};
