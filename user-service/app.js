import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './model/UserModel.js';
import auth from './auth.js';
import { FRONTEND_SERVICE_LOCAL_URL, FRONTEND_SERVICE_PROD_URL } from './url.js';
import 'dotenv/config';

const MIN_USERNAME_LEN = 6;
const MIN_PASSWORD_LEN = 6;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: [FRONTEND_SERVICE_LOCAL_URL, FRONTEND_SERVICE_PROD_URL ],
  credentials: true
})); // config cors so that front-end can use

app.get('/', (_, res) => res.send('User service is running well!'));

app.post('/register', async (req, res) => {
  console.log('\nREGISTER...');

  const {username, password} = req.body;
  if (!username || !password) {
    console.log(
    '[REGISTER][VALIDATION] Client did not provide username/password!',
    );
    return res.status(400).json({
      error: 'Please provide both username and password!',
    });
  }

  // Validation by server incase users try to modify the HTML file or use API to register.
  if (username.length < MIN_USERNAME_LEN || password.length < MIN_PASSWORD_LEN) {
    let message = "";
    let log = "[REGISTER][VALIDATION] ";
    if (username.length < MIN_USERNAME_LEN) {
      message += `Please provide a username that has ${MIN_USERNAME_LEN} or more characters! `
      log += `Username provided by client has less than ${MIN_USERNAME_LEN} characters! `
    }
    if (password.length < MIN_PASSWORD_LEN) {
      message += `Please provide a password that has ${MIN_PASSWORD_LEN} or more characters!`
      log += `Password provided by client has less than ${MIN_PASSWORD_LEN} characters! `
    }
    console.log(log);
    return res.status(400).json({
      error: message
    });
  }

  const user = await User.findUser(username);
  if (user) {
    console.log(`[REGISTER][VALIDATION] Username ${username} already exists!`);
    return res.status(409).json({error: 'Username already exists!'}); // Unauthorized code (authentication fail)
  }

  const newUser = await User.createUser(username, await bcrypt.hash(password, 10), auth.ROLES.User);
  if (!newUser) {
    console.log(`[REGISTER][FAILURE] Server could not create new user ${username}!`);
    return res.status(500).json({error: 'Could not create new user!'});
  }

  console.log(`[REGISTER][SUCCESS] Server created new user ${username} successfully!`);
  console.log(newUser);
  return res.status(201).json({success: `Created new user ${username} successfully!`});
});

app.post('/login', async (req, res) => {
  console.log('\nLOGIN...');

  const {username, password} = req.body;
  if (!username || !password) {
    console.log('[LOGIN][VALIDATION] Client did not provide username/password!');
    return res.status(400).json({error: 'Please provide both username and password!'});
  }

  const user = await User.findUser(username);
  if (!user) {
    console.log(`[LOGIN][VALIDATION] Client gave an invalid username ${user}!`);
    return res.status(401).json({error: 'Invalid username!'}); // Unauthorized code (authentication fail)
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    console.log(`[LOGIN][VALIDATION] Client gave an invalid password ${password}!`);
    return res.status(401).json({error: 'Invalid password!'}); // Unauthorized code (authentication fail)
  }

  const accessToken = jwt.sign(
      {
        'username': user.username,
        'role': user.role,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d',
      },
  );
  console.log(`[LOGIN][TOKEN] Created access token '${accessToken}' successfully!`);
  console.log(`[LOGIN][SUCCESS] Server logged in user ${username} successfully!`);

  return res.status(200).json({success: 'Logged in successfully!', accessToken}); 
});

// The API calls below here onwards require authentication
app.use(auth.validateAccessToken);

app.post('/verify-token-or-role', async (req, res) => {
  console.log('\nVERIFY TOKEN OR ROLE...');
  console.log(req.body)

  const role = req.body.role;
  const validateRoles = auth.validateRoles([role]);
  if (role) {
    if (!validateRoles(req)) {
      console.log('[VERIFY][FAILURE] User has a valid access token but role is not authorized!');
      return res.status(403).json({error: 'User has a valid access token but role is not authorized!' }); // Forbidden code, user is unauthorized (no privilege for action) 
    }
    console.log('[VERIFY][SUCCESS] User has a valid access token and a valid role!');
    return res.status(200).json({success: 'User has a valid access token and a valid role!', username: req.user});
  }

  console.log('[VERIFY][SUCCESS] User has a valid access token!');
  return res.status(200).json({success: 'User have a valid access token!', username: req.user});
});

app.put('/update', auth.validateRoles([auth.ROLES.User]), async (req, res) => {
  // currently only allow password updates
  console.log('\nUPDATE...');
  console.log(req.body)

  const username = req.body.username;

  const {newPassword} = req.body;
  if (!newPassword) {
    console.log('[UPDATE][VALIDATION] Client did not provide new password!');
    return res.status(400).json({error: 'Please provide new password!'});
  }

  const user = await User.findUser(username);
  if (!user) {
    // Should not enter here
    console.log(`[UPDATE][VALIDATION] Client gave an invalid username ${user}!`);
    return res.status(400).json({error: 'Invalid username!'}); // Unauthorized code (authentication fail)
  }

  user.password = await bcrypt.hash(newPassword, 10);

  const isSuccess = await User.updateUser(user);
  if (!isSuccess) {
    console.log(`[UPDATE][FAILURE] Server could not update user ${username}!`);
    console.log(user);
    return res.status(500).json({error: 'Could not update user!'});
  }

  console.log(`[UPDATE][SUCCESS] Server updated user ${username} successfully!`);
  console.log(user);
  return res.status(200).json({success: 'Updated user password successfully!'});
});

app.post('/logout', auth.validateRoles([auth.ROLES.User]), async (req, res) => {
  console.log('\nLOGOUT...');

  const isBlacklistSuccess = await auth.blacklistAccessToken(req);
  if (!isBlacklistSuccess) {
    console.log(`[LOGOUT][FAILURE] Server could not blacklist token!`);
    return res.status(500).json({error: 'Could not logout user!'});
  }

  console.log(`[LOGOUT][SUCCESS] Server logged out user ${req.username} successfully!`);
  return res.status(200).json({message: 'Successfully logged out!'});
  
});

app.delete('/delete', auth.validateRoles([auth.ROLES.User]), async (req, res) => {
  console.log('\nDELETE...');

  const username = req.user;

  const isSuccess = await User.deleteUser(username);
  if (!isSuccess) {
    console.log(`[DELETE][FAILURE] Server could not delete user ${username}!`);
    return res.status(500).json({error: 'Could not delete user!'});
  }

  const isBlacklistSuccess = await auth.blacklistAccessToken(req);
  if (!isBlacklistSuccess) {
    console.log(`[DELETE][FAILURE] Server could not blacklist token!`);
    return res.status(500).json({error: 'Could not logout user!'});
  }

  console.log(`[DELETE][SUCCESS] Server deleted user ${username} successfully!`);
  return res.status(200).json({message: 'Successfully deleted account and logged out!'});
});

export default app;

