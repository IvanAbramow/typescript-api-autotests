import { execSync } from 'child_process';

/**
 * Выполняет команду в оболочке синхронно с принудительной UTF‑8 кодировкой.
 *
 * Упрощает работу с execSync, гарантируя возврат строки в UTF‑8, даже если в системе настроены иные локали.
 *
 * @param command - Команда для выполнения (например, 'node --version')
 * @param options - Опции для execSync (передаются как есть)
 * @returns Вывод команды как строка в UTF‑8
 * @throws {Error} Если команда завершилась с ошибкой
 *
 * @example
 * const output = execSyncEncoded('node --version');
 * console.log(output); // v18.16.0
 *
 * @example
 * // С опциями (например, смена рабочей директории)
 * const list = execSyncEncoded('pwd', { cwd: '/tmp' });
 * console.log(list); // /tmp
 */
export const execSyncEncoded = (command: string, options?: object): string => {
  return execSync(command, { encoding: 'utf8', ...options });
};
