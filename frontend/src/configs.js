const URI_USER_SVC =
  process.env.REACT_APP_ENV === 'dev' ||
  process.env.REACT_APP_ENV === 'docker-dev'
    ? 'http://localhost:8080'
    : 'http://ec2-13-214-194-165.ap-southeast-1.compute.amazonaws.com:8080'
const URI_QUESTION_SVC =
  process.env.REACT_APP_ENV === 'dev' ||
  process.env.REACT_APP_ENV === 'docker-dev'
    ? 'http://localhost:8090'
    : 'http://ec2-13-214-194-165.ap-southeast-1.compute.amazonaws.com:8090'
export const URI_COLLABORATION_SVC =
  process.env.REACT_APP_ENV === 'dev' ||
  process.env.REACT_APP_ENV === 'docker-dev'
    ? 'ws://localhost:5001'
    : 'ws://ec2-13-214-194-165.ap-southeast-1.compute.amazonaws.com:5001'
export const URI_MATCHING_SVC =
  process.env.REACT_APP_ENV === 'dev' ||
  process.env.REACT_APP_ENV === 'docker-dev'
    ? 'ws://localhost:5003'
    : 'ws://ec2-13-214-194-165.ap-southeast-1.compute.amazonaws.com:5003'
export const URI_CHAT_SVC =
  process.env.REACT_APP_ENV === 'dev' ||
  process.env.REACT_APP_ENV === 'docker-dev'
    ? 'ws://localhost:5005'
    : 'ws://ec2-13-214-194-165.ap-southeast-1.compute.amazonaws.com:5005'

const PREFIX_REGISTER_USER_SVC = '/register'
const PREFIX_LOGIN_USER_SVC = '/login'
const PREFIX_AUTH_USER_SVC = '/check-token'
const PREFIX_VALIDATE_SESSION_SVC = '/verify-token-or-role'
const PREFIX_LOGOUT_USER_SVC = '/logout'
const PREFIX_UPDATE_PASSWORD_USER_SVC = '/update'
const PREFIX_SELECT_QUESTION_DIFFICULTY = '/dashboard'

const PREFIX_GET_TWO_QUESTIONS_BY_DIFF_QUESTION_SVC =
  '/get-two-questions-by-diff'

export const URL_REGISTER_USER_SVC = URI_USER_SVC + PREFIX_REGISTER_USER_SVC
export const URL_LOGIN_USER_SVC = URI_USER_SVC + PREFIX_LOGIN_USER_SVC
export const URL_AUTH_USER_SVC = URI_USER_SVC + PREFIX_AUTH_USER_SVC
export const URL_VALIDATE_SESSION_SVC =
  URI_USER_SVC + PREFIX_VALIDATE_SESSION_SVC
export const URL_LOGOUT_USER_SVC = URI_USER_SVC + PREFIX_LOGOUT_USER_SVC
export const URL_UPDATE_PASSWORD_USER_SVC =
  URI_USER_SVC + PREFIX_UPDATE_PASSWORD_USER_SVC
export const URL_GET_TWO_QUESTIONS_BY_DIFF_QUESTION_SVC =
  URI_QUESTION_SVC + PREFIX_GET_TWO_QUESTIONS_BY_DIFF_QUESTION_SVC
export const URL_SELECT_QUESTION_DIFFICULTY =
  URI_USER_SVC + PREFIX_SELECT_QUESTION_DIFFICULTY
