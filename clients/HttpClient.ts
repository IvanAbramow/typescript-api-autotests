import { HttpLogger } from '@packages/utils';
import { APIRequestContext, APIResponse } from '@playwright/test';
import { HttpResponse, RequestParams, RequestTypes } from '../types';

/** Параметры для GET запроса (исключая data, form, multipart) */
type GetRequestParams = Omit<RequestParams, 'data' | 'form' | 'multipart'>;

/**
 * Базовый клиент для работы с HTTP API через Playwright
 *
 * Класс предоставляет методы для выполнения HTTP запросов (GET, POST, PUT, PATCH, DELETE)
 * с автоматическим логированием и валидацией ответов.
 *
 *
 * @example
 * const apiClient = new ApiClient(request);
 * const response = await apiClient.getRequest<MyType>('/api/users');
 *
 * @property {APIRequestContext} request - Контекст запроса Playwright
 * @property {HttpLogger} httpLogger - Логгер для HTTP запросов и ответов
 */
export class HttpClient {
  /** Контекст запроса Playwright для выполнения HTTP запросов */
  readonly request: APIRequestContext;

  /** Логгер для записи HTTP запросов и ответов */
  private readonly httpLogger = new HttpLogger();

  /**
   * Создает экземпляр ApiClient
   *
   * @param {APIRequestContext} request - Контекст запроса Playwright
   *
   * @example
   * const httpClient = new httpClient(requestContext);
   */
  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Преобразует ответ API в структурированный объект ApiResponse
   *
   * Метод парсит тело ответа (поддерживает JSON и plain text),
   * извлекает все метаданные ответа и возвращает их в структурированном виде.
   *
   * @async
   * @template T - Тип данных тела ответа
   * @param {APIResponse} response - Ответ от API Playwright
   * @returns {Promise<HttpResponse<T>>} Структурированный ответ API
   *
   * @throws {Error} Если не удается обработать тело ответа
   *
   * @example
   * const httpResponse = await request.get('/api/users');
   * const parsed = await responseParams<User[]>(apiResponse);
   * // parsed содержит { url, body, headers, status, statusText, headersArray, buffer }
   */
  async responseParams<T>(response: APIResponse): Promise<HttpResponse<T>> {
    let body: T;

    const textBody = await response.text();

    try {
      body = JSON.parse(textBody);
    } catch {
      body = textBody as unknown as T;
    }

    const url = response.url();
    const status = response.status();
    const statusText = response.statusText();
    const headers = response.headers();
    const headersArray = response.headersArray();
    const buffer = await response.body();

    return { body, buffer, headers, headersArray, status, statusText, url };
  }

  /**
   * Выполняет GET запрос к указанному URL
   *
   * Метод выполняет HTTP GET запрос, логирует его и возвращает структурированный ответ.
   *
   * @async
   * @template T - Ожидаемый тип данных в теле ответа
   * @param {string} url - URL для запроса
   * @param {GetRequestParams} [params] - Дополнительные параметры запроса
   * @returns {Promise<HttpResponse<T>>} Структурированный ответ API
   *
   * @example
   * const response = await getRequest<User[]>('/api/users', {
   *   headers: { 'Authorization': 'Bearer token' },
   *   params: { page: 1, limit: 10 }
   * });
   */
  async getRequest<T>(url: string, params?: GetRequestParams) {
    const apiResponse = await this.request.get(url, params);
    const response = await this.responseParams<T>(apiResponse);

    this.httpLogger.requestLog({
      method: RequestTypes.GET,
      params,
      url: response.url,
    });
    this.httpLogger.responseLog(response);

    return response;
  }

  /**
   * Выполняет POST запрос к указанному URL
   *
   * Метод выполняет HTTP POST запрос, логирует его и возвращает структурированный ответ.
   *
   * @async
   * @template T - Ожидаемый тип данных в теле ответа
   * @param {string} url - URL для запроса
   * @param {RequestParams} [params] - Параметры запроса (тело, заголовки и т.д.)
   * @returns {Promise<HttpResponse<T>>} Структурированный ответ API
   *
   * @example
   * const response = await postRequest<CreatedUser>('/api/users', {
   *   data: { name: 'John', email: 'john@example.com' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   */
  async postRequest<T>(url: string, params?: RequestParams) {
    const httpResponse = await this.request.post(url, params);
    const response = await this.responseParams<T>(httpResponse);

    this.httpLogger.requestLog({
      method: RequestTypes.POST,
      params,
      url: response.url.toString().length < url.length ? url : response.url,
    });
    this.httpLogger.responseLog(response);

    return response;
  }

  /**
   * Выполняет PUT запрос к указанному URL
   *
   * Метод выполняет HTTP PUT запрос, логирует его и возвращает структурированный ответ.
   *
   * @async
   * @template T - Ожидаемый тип данных в теле ответа
   * @param {string} url - URL для запроса
   * @param {RequestParams} [params] - Параметры запроса
   * @returns {Promise<HttpResponse<T>>} Структурированный ответ API
   *
   * @example
   * const response = await putRequest<User>('/api/users/123', {
   *   data: { name: 'John Updated', email: 'john.updated@example.com' }
   * });
   */
  async putRequest<T>(url: string, params?: RequestParams) {
    const httpResponse = await this.request.put(url, params);
    const response = await this.responseParams<T>(httpResponse);

    this.httpLogger.requestLog({
      method: RequestTypes.PUT,
      params,
      url: response.url,
    });
    this.httpLogger.responseLog(response);

    return response;
  }

  /**
   * Выполняет PATCH запрос к указанному URL
   *
   * Метод выполняет HTTP PATCH запрос, логирует его и возвращает структурированный ответ.
   *
   * @async
   * @template T - Ожидаемый тип данных в теле ответа
   * @param {string} url - URL для запроса
   * @param {RequestParams} [params] - Параметры запроса
   * @returns {Promise<HttpResponse<T>>} Структурированный ответ API
   *
   * @example
   * const response = await patchRequest<User>('/api/users/123', {
   *   data: { email: 'new.email@example.com' }
   * });
   */
  async patchRequest<T>(url: string, params?: RequestParams) {
    const httpResponse = await this.request.patch(url, params);
    const response = await this.responseParams<T>(httpResponse);

    this.httpLogger.requestLog({
      method: RequestTypes.PATCH,
      params,
      url: response.url,
    });
    this.httpLogger.responseLog(response);

    return response;
  }

  /**
   * Выполняет DELETE запрос к указанному URL
   *
   * Метод выполняет HTTP DELETE запрос, логирует его и возвращает структурированный ответ.
   *
   * @async
   * @template T - Ожидаемый тип данных в теле ответа
   * @param {string} url - URL для запроса
   * @param {RequestParams} [params] - Параметры запроса
   * @returns {Promise<HttpResponse<T>>} Структурированный ответ API
   *
   * @example
   * const response = await deleteRequest<DeleteResponse>('/api/users/123');
   */
  async deleteRequest<T>(url: string, params?: RequestParams) {
    const httpResponse = await this.request.delete(url, params);
    const response = await this.responseParams<T>(httpResponse);

    this.httpLogger.requestLog({
      method: RequestTypes.DELETE,
      params,
      url: response.url,
    });
    this.httpLogger.responseLog(response);

    return response;
  }
}
