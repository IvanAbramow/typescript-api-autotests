enum LoggerParams {
  info = 'info',
  error = 'error',
  params = 'params',
  warning = 'warning',
  docker = 'docker',
  node = 'node',
  request = 'request',
  responseBody = 'responseBody',
  responseStatus = 'responseStatus',
  responseHeaders = 'responseHeaders',
}

type Loggers = {
  [key in LoggerParams]: (...messages: unknown[]) => void;
};

const colour = {
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  grey: '\x1b[90m',
  magenta: '\x1b[35m',
  orange: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[0m',
};

const logTypeColors: Record<LoggerParams, string> = {
  [LoggerParams.info]: colour.grey,
  [LoggerParams.error]: colour.red,
  [LoggerParams.params]: colour.blue,
  [LoggerParams.warning]: colour.orange,
  [LoggerParams.docker]: colour.blue,
  [LoggerParams.node]: colour.green,
  [LoggerParams.request]: colour.cyan,
  [LoggerParams.responseBody]: colour.orange,
  [LoggerParams.responseStatus]: colour.orange,
  [LoggerParams.responseHeaders]: colour.orange,
};

/**
 * Форматирует сообщения, преобразуя объекты в JSON‑строки.
 *
 * @param {Array<any>} messages - Массив сообщений для форматирования
 * @returns {Array<string>} Отформатированные сообщения (объекты преобразованы в JSON)
 *
 * @example
 * formatLogMessages(['Hello', { key: 'value' }]);
 * // ['Hello', '{"key":"value"}']
 */
function formatLogMessages(messages: unknown[]): unknown[] {
  return messages.map((message) => {
    if (typeof message === 'object' && message !== null) {
      return JSON.stringify(message);
    }

    return message;
  });
}

/**
 * Выводит лог с форматированием: дата, тип сообщения, содержимое.
 *
 * @param {string} logType - Тип лога (должен быть ключом LoggerParams)
 * @param {...any} messages - Сообщения для вывода (могут быть любого типа)
 *
 * @example
 * logger('info', 'Application started', { port: 3000 });
 * // [12:00:00.000] info: Application started {"port":3000}
 */
function logger(logType: LoggerParams, ...messages: unknown[]) {
  const date = new Date().toISOString().substring(11, 23);
  const formattedMessages = formatLogMessages(messages);

  const logTypeColour = logTypeColors[logType] || colour.green;

  const logParts: unknown[] = [];

  logParts.push(colour.grey, date);
  logParts.push(logTypeColour, logType + ':', colour.white);
  logParts.push(...formattedMessages);

  console.log(...logParts);
}

/**
 * Объект-логгер с методами для разных типов сообщений.
 *
 * Создаёт обёртки для функции logger под каждый тип лога.
 * Доступные методы:
 * - log.info(...)
 * - log.error(...)
 * - log.params(...)
 * - log.warning(...)
 *
 * @namespace
 * @property {function} info - Лог информационного типа
 * @property {function} error - Лог ошибок
 * @property {function} params - Лог параметров
 * @property {function} warning - Лог предупреждений
 *
 * @example
 * log.info('Service ready');
 * log.error('Failed to connect', { error: e.message });
 * log.params('Request params', { userId: 123 });
 * log.warning('Deprecated method call');
 */
export const log = Object.values(LoggerParams).reduce((acc, type) => {
  acc[type] = (...messages: unknown[]) => logger(type, ...messages);

  return acc;
}, {} as Loggers);
