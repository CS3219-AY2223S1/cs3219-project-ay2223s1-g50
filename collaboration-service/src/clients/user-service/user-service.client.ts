import axios from 'axios'
import {
  UserRole,
  ValidateTokenBody,
  ValidateTokenResponse,
} from './user-service.model'
import { USER_SERVICE_URL } from '../../url'

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

    try {
      return axios
        .post(`${USER_SERVICE_URL}/verify-token-or-role`, body, {
          headers: {
            authorization: token,
          },
        })
        .then((resp) => resp.data)
    } catch (e) {
      console.log(e)
      return { error: e + '' }
    }
  }
}

/** Singleton instance */
export const userServiceClientImpl = new UserServiceClientImpl()
