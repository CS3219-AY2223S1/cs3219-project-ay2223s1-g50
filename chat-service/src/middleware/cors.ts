import cors, { CorsOptions } from 'cors'

const allowLocalhost3000InDev =
  process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'docker-dev' 
    ? ['http://localhost:3000'] 
    : [];


const options: CorsOptions = {
  origin: allowLocalhost3000InDev,
  credentials: true,
}

export const corsWithOptions = cors(options)
