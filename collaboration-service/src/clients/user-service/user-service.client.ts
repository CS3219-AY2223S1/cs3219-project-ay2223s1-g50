import axios from 'axios'
import {
  UserRole,
  ValidateTokenBody,
  ValidateTokenResponse,
} from './user-service.model'

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

    return axios.post(
      `${process.env.USER_SERVICE_URL}/verify-token-or-role`,
      body,
      {
        headers: {
          authorization: token,
        },
      }
    )
  }
}

/** Singleton instance */
export const userServiceClientImpl = new UserServiceClientImpl()
