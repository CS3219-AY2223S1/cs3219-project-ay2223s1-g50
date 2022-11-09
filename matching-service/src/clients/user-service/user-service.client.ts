import axios from 'axios'
import {
  UserRole,
  ValidateTokenBody,
  ValidateTokenResponse,
} from './user-service.model'
import { USER_SERVICE_URL } from '../../url';

export abstract class UserServiceClient {
  abstract validateAccessTokenAndRole(
    token: string,
    role: UserRole
  ): Promise<ValidateTokenResponse>
}

export class UserServiceClientImpl extends UserServiceClient {
  async validateAccessTokenAndRole(
    token: string,
    role: UserRole = UserRole.User
  ): Promise<ValidateTokenResponse> {
    const body: ValidateTokenBody = {
      role,
    }

    const { data } = await axios.post(
      `${USER_SERVICE_URL}/verify-token-or-role`,
      body,
      {
        headers: {
          authorization: token,
        },
      }
    )

    return data
  }
}

/** Singleton instance */
export const userServiceClientImpl = new UserServiceClientImpl()
