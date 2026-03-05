import { log } from '@packages/utils';
import CONFIG from '../../../playwright.config';
import { HttpResponse, RequestParams } from '../../../types';

/**
 * Логгер для HTTP запросов и ответов
 *
 * Класс предоставляет функциональность для логирования HTTP запросов в формате cURL
 * и форматирования ответов для удобного отображения в логах.
 *
 * @example
 * const logger = new HttpLogger();
 * logger.requestLog({
 *   method: 'GET',
 *   url: '/api/users',
 *   params: { headers: { 'Authorization': 'Bearer token' } }
 * });
 *
 * @property {Function} formatHeaders - Приватная функция для форматирования заголовков
 */
export class HttpLogger {
  /**
   * Форматирует заголовки HTTP запроса в строку для команды cURL
   *
   * Преобразует объект заголовков в строку вида:
   * -H 'Header-Name: header-value' -H 'Another-Header: another-value'
   *
   * @private
   * @param {Record<string, string | undefined>} headers - Объект с заголовками запроса
   * @returns {string} Отформатированная строка заголовков для cURL
   *
   * @example
   * const headers = { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' };
   * // Возвращает: "-H 'Authorization: Bearer token' -H 'Content-Type: application/json'"
   */
  private formatHeaders = (headers: Record<string, string | undefined>): string =>
    Object.entries(headers)
      .map(([key, value]) => `-H '${key}: ${value}'`)
      .join(' ');

  /**
   * Декодирует закодированные данные URL
   *
   * @private
   * @param {string} encodedData - Закодированная строка данных
   * @returns {string} Декодированная строка данных
   */
  private decodeUrlData(encodedData: string): string {
    try {
      const parsed = JSON.parse(encodedData);

      return JSON.stringify(parsed);
    } catch {
      try {
        return decodeURIComponent(encodedData);
      } catch {
        return encodedData;
      }
    }
  }

  /**
   * Форматирует тело запроса для команды cURL
   *
   * Обрабатывает различные типы данных:
   * - JSON данные
   * - Form-urlencoded данные
   *
   * @private
   * @returns {string} Отформатированная строка с телом запроса
   */
  private formatRequestBody(
    data?: string | object | undefined,
    form?:
      | {
          [p: string]: string | number | boolean;
        }
      | undefined,
  ): string {
    if (data) {
      const formattedData = JSON.stringify(data);
      const decodedData = this.decodeUrlData(formattedData);

      return `--data '${decodedData}'`;
    }

    if (form) {
      const formData = Object.entries(form)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      return `--data-urlencode '${formData}'`;
    }

    return '';
  }

  /**
   * Логирует HTTP запрос в формате команды cURL
   *
   * Метод формирует команду cURL для отправленного запроса, включая:
   * - Метод HTTP (GET, POST, PUT, DELETE и т.д.)
   * - URL запроса
   * - Заголовки (автоматически добавляет Content-Type если нужно)
   * - Тело запроса (JSON, form-urlencoded, multipart)
   * - User-Agent из конфигурации Playwright
   *
   * Автоматически определяет Content-Type на основе типа данных:
   * - application/json для JSON данных
   * - application/x-www-form-urlencoded для form данных
   * - multipart/form-data для multipart данных
   *
   * @param url - - URL запроса
   * @param params - - Параметры для логирования запроса
   * @param method - - HTTP метод (GET, POST, PUT, DELETE и т.д.)
   * @param {RequestParams} [params.params] - Дополнительные параметры запроса (заголовки, тело и т.д.)
   *
   * @example
   * requestLog({
   *   method: 'POST',
   *   url: 'https://api.example.com/users',
   *   params: {
   *     headers: { 'Authorization': 'Bearer token' },
   *     data: { name: 'John', email: 'john@example.com' }
   *   }
   * });
   * // Логирует: curl -X POST 'https://api.example.com/users' --data '{"name":"John","email":"john@example.com"}' ...
   */
  requestLog({ url, params, method }: { method: string; url: string; params?: RequestParams }) {
    const { headers, data, form, multipart } = params || {};

    const headersCopy = { ...headers };

    let contentTypeHeader = headersCopy['content-type'];

    if (!contentTypeHeader) {
      if (data) {
        contentTypeHeader = 'application/json; charset=utf-8';
      } else if (form) {
        contentTypeHeader = 'application/x-www-form-urlencoded; charset=utf-8';
      } else if (multipart) {
        contentTypeHeader = 'multipart/form-data; charset=utf-8';
      }

      if (contentTypeHeader) {
        headersCopy['content-type'] = contentTypeHeader;
      }
    }

    const requestBodyParams = this.formatRequestBody();
    const headerParams = this.formatHeaders(headersCopy);
    const userAgentHeader = `-H 'User-Agent: ${headersCopy['User-Agent'] ?? CONFIG?.use?.userAgent}'`;

    const curlCommand = `curl -X ${method} '${url}' ${requestBodyParams} ${headerParams} ${userAgentHeader} -i`;

    log.request(curlCommand);
  }

  /**
   * Логирует HTTP ответ
   *
   * Метод форматирует и выводит информацию об ответе:
   * - Статус код и текст статуса
   * - Тело ответа (если оно меньше 2000 символов)
   * - Дополнительные заголовки (x-payload, x-platform, x-client)
   *
   * @param {HttpResponse} response - Объект ответа API
   *
   * @example
   * responseLog({
   *   status: 200,
   *   statusText: 'OK',
   *   body: { id: 1, name: 'John' },
   *   headers: { 'x-payload': 'abc123', 'Content-Type': 'application/json' }
   * });
   * // Логирует статус, тело ответа и заголовки x-payload, x-platform, x-client если они есть
   */
  responseLog<T>(response: HttpResponse<T>) {
    const { body, status, statusText, headers } = response;

    log.responseStatus(`${status} ${statusText}`);

    const bodyString = JSON.stringify(body, null, 0);

    if (bodyString.length < 2000) {
      log.responseBody(bodyString);
    }

    const extraHeaders = ['x-payload', 'x-platform', 'x-client'];
    extraHeaders.forEach((headerKey) => {
      if (headers[headerKey]) {
        log.responseHeaders(`${headerKey}: ${headers[headerKey]}`);
      }
    });
  }
}
