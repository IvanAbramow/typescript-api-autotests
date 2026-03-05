import { Route } from '@playwright/test';
import { ReadStream } from 'fs';

type QueryParams = { [key: string]: string | number | boolean };

export type HttpResponse<T> = {
  url: string;
  body: T;
  headers: Record<string, unknown>;
  status: number;
  statusText: string;
  headersArray: { name: string; value: string }[];
  buffer: Buffer;
};

export type RequestParams = {
  params?: QueryParams;
  data?: object | string;
  form?: { [key: string]: string | number | boolean };
  multipart?:
    | FormData
    | {
        [key: string]:
          | string
          | number
          | boolean
          | ReadStream
          | {
              /**
               * File name
               */
              name: string;

              /**
               * File type
               */
              mimeType: string;

              /**
               * File content
               */
              buffer: Buffer;
            };
      };
  headers?:
    | {
        [key: string]: string;
      }
    | undefined;
  timeout?: number;
  maxRedirects?: number;
};

export const enum RequestTypes {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export type MemberItems = Array<string | { name: string; webLink?: boolean }>;

export type MemberItemsV1 = Array<string | { name: string; webLink?: boolean; isDrActive?: boolean }>;

export type MockParam = {
  url: string | RegExp | ((url: URL) => boolean);
  response: Parameters<Route['fulfill']>[0];
};
