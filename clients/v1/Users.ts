import { Step } from '@packages/utils/decorators/Step';
import { HttpResponse } from '../../types';
import { HttpClient } from '../HttpClient';

export class UsersClient extends HttpClient {
  private readonly url = 'v1/users';

  @Step('Get user me')
  async getMeRequest<T>(): Promise<HttpResponse<T>> {
    return this.getRequest(`${this.url}/me`);
  }
}
