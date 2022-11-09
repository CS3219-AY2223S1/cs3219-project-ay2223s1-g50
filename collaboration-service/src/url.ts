const USER_SERVICE_LOCAL_URL = "http://localhost:8080";
const USER_SERVICE_DOCKER_URL = "http://host.docker.internal:8080";
const USER_SERVICE_PROD_URL = "http://localhost:8080";

const QUESTION_SERVICE_LOCAL_URL = "http://localhost:8090";
const QUESTION_SERVICE_DOCKER_URL = "http://host.docker.internal:8090";
const QUESTION_SERVICE_PROD_URL = "http://localhost:8090";

export const FRONTEND_SERVICE_LOCAL_URL = "http://localhost:3000";
export const FRONTEND_SERVICE_PROD_URL = "http://ec2-13-214-194-165.ap-southeast-1.compute.amazonaws.com:3000";

export const USER_SERVICE_URL = process.env.NODE_ENV == "dev"
  ? USER_SERVICE_LOCAL_URL
  : process.env.NODE_ENV == "docker-dev"
    ? USER_SERVICE_DOCKER_URL 
    : USER_SERVICE_PROD_URL;

export const QUESTION_SERVICE_URL = process.env.NODE_ENV == "dev"
  ? QUESTION_SERVICE_LOCAL_URL
  : process.env.NODE_ENV == "docker-dev"
    ? QUESTION_SERVICE_DOCKER_URL 
    : QUESTION_SERVICE_PROD_URL;

export const FRONTEND_SERVICE_URL = process.env.NODE_ENV == "dev" || process.env.NODE_ENV == "docker-dev"
  ? FRONTEND_SERVICE_LOCAL_URL
  : FRONTEND_SERVICE_PROD_URL;
