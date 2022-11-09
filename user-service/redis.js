import Redis from 'ioredis';
import { RedisMemoryServer } from 'redis-memory-server';

// TODO transition to AWS ElastiCache

// use Redis memory server for now for ease of dev
const redisServer = new RedisMemoryServer();

// fix lint issue
const host = await redisServer.getHost();
const port = await redisServer.getPort();

const redis = new Redis(host, port);
redis.on('error', (err) => console.log('Redis Client Error', err));

export default redis;