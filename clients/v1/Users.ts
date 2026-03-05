import { Step } from '@packages/utils/decorators/Step';
import { z } from 'zod';
import { HttpClient } from '../HttpClient';

const UserMeSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
});

type UserMe = z.infer<typeof UserMeSchema>;

export class Users extends HttpClient {
  private readonly url = '/v1/users';

  @Step('Get user me')
  async getMeRequest(): Promise<UserMe> {
    const response = await this.getRequest<UserMe>(`${this.url}/me`);
    return UserMeSchema.parse(response);
  }
}
