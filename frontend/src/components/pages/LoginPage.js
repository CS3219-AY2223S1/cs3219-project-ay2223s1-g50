import React from 'react'
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Link, useNavigate } from 'react-router-dom'

import { STATUS_CODE_SUCCESS } from '../../constants'
import { URL_LOGIN_USER_SVC } from '../../configs'
import classes from './LoginSignUpPage.module.css'
import { UserContext } from '../context/user-context'
import {
  USER_SERVICE_NETWORK_ERROR_MESSAGE,
  STATUS_CODE_UNAUTHORIZED,
} from '../../constants'
import Logo from '../ui/Logo'

const LoginPage = () => {
  const userContext = React.useContext(UserContext)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [usernameIsEmpty, setUsernameIsEmpty] = React.useState(false)
  const [passwordIsEmpty, setPasswordIsEmpty] = React.useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false)
  const [dialogTitle, setDialogTitle] = React.useState('')
  const [dialogMsg, setDialogMsg] = React.useState('')
  const [isLoginSuccess, setIsLoginSuccess] = React.useState(false)
  const [setIsDialogOpen] = React.useState(false)

  /// Method for logging in a user
  const handleLogin = async () => {
    setIsLoginSuccess(false)
    setUsernameIsEmpty(false)
    setPasswordIsEmpty(false)

    if (!username) {
      setUsernameIsEmpty(true)
    }
    if (!password) {
      setPasswordIsEmpty(true)
    }
    if (!(username || password)) {
      return
    }

    setIsLoading(true)
    try {
      const res = await axios.post(URL_LOGIN_USER_SVC, { username, password })

      if (res?.status == STATUS_CODE_SUCCESS) {
        userContext.setUsername(username)
        userContext.setToken(res.data.accessToken)
        Cookies.set('token', res.data.accessToken)
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.response.status == STATUS_CODE_UNAUTHORIZED) {
        setErrorDialog(err.message, 'Either username or password is wrong')
      } else {
        setErrorDialog(err.message, USER_SERVICE_NETWORK_ERROR_MESSAGE)
      }
    }
    setIsLoading(false)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const setErrorDialog = (title, msg) => {
    setIsLoginDialogOpen(true)
    setDialogTitle(title)
    setDialogMsg(msg)
  }

  const closeLoginDialog = () => setIsLoginDialogOpen(false)

  const loginDialog = (
    <Dialog open={isLoginDialogOpen} onClose={closeDialog}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogMsg}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {isLoginSuccess ? (
          <Button component={Link} to="/login">
            Log in
          </Button>
        ) : (
          <Button onClick={closeLoginDialog}>Done</Button>
        )}
      </DialogActions>
    </Dialog>
  )

  return (
    <Box
      data-testid="login-page"
      display={'flex'}
      flexDirection={'column'}
      width={'50%'}
      margin={'4rem auto auto'}
      border={'solid #e2f0f1 2px'}
      borderRadius={'5%'}
      padding={'50px 100px'}
    >
      <Logo size="h5" margin="0 auto 2rem" />
      <Typography variant={'h4'} margin={'0 auto 2rem'}>
        Login to PeerPrep
      </Typography>
      <TextField
        data-testid="login-page-username"
        error={usernameIsEmpty}
        label="Username"
        helperText={usernameIsEmpty && 'Field cannot be empty.'}
        onChange={(event) => setUsername(event.target.value)}
        sx={{ marginBottom: '1rem' }}
        autoFocus
      />
      <TextField
        data-testid="login-page-password"
        error={passwordIsEmpty}
        label="Password"
        helperText={passwordIsEmpty && 'Field cannot be empty.'}
        type="password"
        onChange={(event) => setPassword(event.target.value)}
        sx={{ marginBottom: '2rem' }}
      />
      <Typography
        variant={'subtitle2'}
        className={[classes['box-text'], classes.login].join(' ')}
        component={Link}
        to="/signup"
      >
        Don't have an account? Click here to register
      </Typography>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Button variant="outlined" onClick={handleLogin}>
            Login
          </Button>
        )}
      </Box>
      {loginDialog}
    </Box>
  )
}

export default LoginPage
