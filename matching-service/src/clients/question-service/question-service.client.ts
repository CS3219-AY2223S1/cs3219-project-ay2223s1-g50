import axios, { AxiosResponse } from 'axios'
import { Difficulty } from '../../shared/rooms.model'
import { QuestionPairResponse } from './question-service.model'
import { QUESTION_SERVICE_URL } from '../../url';

export abstract class QuestionServiceClient {
  abstract getQuestionPairByDifficulty(
    token: string,
    difficulty: Difficulty
  ): Promise<AxiosResponse<QuestionPairResponse>>
}

export class QuestionServiceClientImpl extends QuestionServiceClient {
  async getQuestionPairByDifficulty(
    token: string,
    difficulty: Difficulty
  ): Promise<AxiosResponse<QuestionPairResponse>> {
    const body = { difficulty }
    return axios.post(
      `${QUESTION_SERVICE_URL}/get-two-questions-by-diff`,
      body,
      {
        headers: {
          Authorization: token,
        },
      }
    )
  }
}

export const questionServiceClientImpl = new QuestionServiceClientImpl()
