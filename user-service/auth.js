import jwt from 'jsonwebtoken';
import redis from './redis.js';
import 'dotenv/config';

const ROLES = {
  "Admin": 900,
  "User": 100
};

const validateAccessToken = async (req, res, next) => {
  console.log('\nTOKEN...');
  
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    console.log(`[TOKEN][VALIDATION] Can't find authorization header!\n ${JSON.stringify(req.headers)}`);
    return res.status(401).json({ 'error': 'Request has no authorization header!' }); // Unauthorized code (authentication fail)
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    console.log(`[TOKEN][VALIDATION] Can't find token!\n ${authorizationHeader}`);
    return res.status(401).json({ 'error': 'Request has no JWT!' }); // Unauthorized code (authentication fail)
  }

  const isTokenBlacklisted = await checkTokenBlacklisted(token);
  if (isTokenBlacklisted) {
    console.log(`[TOKEN][VALIDATION] Token is blacklisted!\n Token: ${token}`);
    return res.status(401).json({ 'error': 'Blacklisted JWT!' }); // Unauthorized code (authentication fail)
  }

  jwt.verify(
    token,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        console.log(`[TOKEN][FAILURE] Token is invalid! Decoded:\n ${JSON.stringify(decoded)}`);
        return res.status(401).json({ 'error': 'Invalid/Expired JWT!' }); // Unauthorized code (authentication fail)
      }

      console.log(`[TOKEN][VALIDATION] Decoded:\n ${JSON.stringify(decoded)}`);

      // Attach decoded information to request so server can further process it
      req.user = decoded.username;
      req.role = decoded.role;

      console.log(`[TOKEN][SUCCESS] Token is validated!\n Token: ${token}`);

      next();
    }
  );
}

const validateRoles = (allowedRoles) => {
  return (req, res, next) => {
    console.log('\nROLES...');

    const role = req.role;
    if (!role) {
      console.log(`[ROLE][FAILURE] User does not have a role!`);
      // If there res is passed in, it means this is to be used as middleware, else just a normal function
      return res 
        ? res.status(403).json({ 'error': 'User does not have a role!' }) // Forbidden code, user is unauthorized (no privilege for action)
        : false;
    }

    console.log(`[ROLE] Looking for: ${allowedRoles}`);
    console.log(`[ROLE] Received: ${role}`);

    const hasPermission = allowedRoles.includes(role);
    if (!hasPermission) {
      console.log('[ROLE][FAILURE] User has no permission!');
      return res 
        ? res.status(403).json({ 'error': 'User does not have permission for this action!' }) // Forbidden code, user is unauthorized (no privilege for action)
        : false;
    }

    console.log(`[ROLE][SUCCESS] Role is validated!`);
    if (next) {
      next();
    } else {
      return true;
    }
  }
}

const checkTokenBlacklisted = async (token) => {
  return await redis.exists(token);
};

const blacklistAccessToken = async (req) => {
  try {
    console.log('\nBLACKLIST...');

    // Can assume we have authorization header and token since already validated access token
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split(' ')[1];

    console.log(`Token: ${token}`);

    // Remember to delete access token on client-side!
    await redis.set(token, '', 'EX', 60 * 60 * 24 * 2); // Invalidate it for 2 days (more than token's ttl)

    console.log(`[BLACKLIST][SUCCESS] Server blacklisted token successfully!`);
    return true;
  } catch (err) {
    console.log(`[BLACKLIST][FAILURE] Server failed to blacklist token:\n ${err}`);
    return false;
  }
}

export default { ROLES, validateAccessToken, validateRoles, blacklistAccessToken };
