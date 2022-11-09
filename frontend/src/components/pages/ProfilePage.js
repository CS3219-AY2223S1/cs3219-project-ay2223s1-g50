import React from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import axios from 'axios'

import { UserContext } from '../context/user-context'
import { URL_UPDATE_PASSWORD_USER_SVC } from '../../configs'
import { STATUS_CODE_SUCCESS } from '../../constants'

const Profile = () => {
  const userContext = React.useContext(UserContext)
  const username = userContext.username
  const token = userContext.token
  const [isLoading, setIsLoading] = React.useState(false)
  const [newPassword, setNewPassword] = React.useState('')
  const [newPasswordError, setNewPasswordError] = React.useState(false)
  const [newPasswordHelper, setNewPasswordHelper] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false)
  const [confirmPasswordHelper, setConfirmPasswordHelper] = React.useState('')
  const [dialogTitle, setDialogTitle] = React.useState('Enter new password')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [dialogMsg, setDialogMsg] = React.useState('')
  const [entered, setEntered] = React.useState(false)

  const handleOnClick = () => {
    setEntered(false)
    setNewPasswordError(false)
    setConfirmPasswordError(false)
    setIsDialogOpen(true)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const setSuccessDialog = (msg) => {
    setIsDialogOpen(true)
    setDialogTitle('Success')
    setDialogMsg(msg)
  }

  const setErrorDialog = (msg) => {
    setIsDialogOpen(true)
    setDialogTitle('Error')
    setDialogMsg(msg)
  }

  const handleSubmit = async () => {
    if (entered) {
      closeDialog()
      return
    }

    if (!newPassword) {
      setNewPasswordError(true)
      setNewPasswordHelper('Field cannot be empty')
    }
    if (!confirmPassword) {
      setConfirmPasswordError(true)
      setConfirmPasswordHelper('Field cannot be empty')
    }
    if (newPassword && newPassword.length < 6) {
      setNewPasswordError(true)
      setNewPasswordHelper('Password must be at least 6 characters long')
    }
    if (confirmPassword && confirmPassword.length < 6) {
      setConfirmPasswordError(true)
      setConfirmPasswordHelper('Password must be at least 6 characters long')
    }
    if (
      !(
        newPassword &&
        confirmPassword &&
        newPassword.length >= 6 &&
        confirmPassword.length >= 6
      )
    ) {
      return
    }
    if (newPassword !== confirmPassword) {
      setEntered(true)
      setDialogMsg('Password does not match!')
      setDialogTitle('Oops')
      setNewPassword('')
      setConfirmPassword('')
      return
    }
    setIsLoading(true)
    setEntered(true)
    const res = await axios
      .put(
        URL_UPDATE_PASSWORD_USER_SVC,
        { username, newPassword },
        { headers: { authorization: `Bearer ${token}` } }
      )
      .catch((err) => {
        setErrorDialog(err.response.data.error)
      })
    if (res?.status === STATUS_CODE_SUCCESS) {
      setSuccessDialog(res.data.success)
    }
    setIsLoading(false)
  }

  const passwordField = (
    <TextField
      required
      error={newPasswordError}
      label="Password"
      type="password"
      variant="standard"
      value={newPassword}
      helperText={newPasswordError && newPasswordHelper}
      onChange={(e) => {
        setNewPassword(e.target.value)
      }}
      sx={{ marginBottom: '1rem' }}
      autoFocus
    />
  )

  const confirmPasswordField = (
    <TextField
      required
      error={confirmPasswordError}
      label="Confirm Password"
      type="password"
      variant="standard"
      value={confirmPassword}
      helperText={confirmPasswordError && confirmPasswordHelper}
      onChange={(e) => {
        setConfirmPassword(e.target.value)
      }}
      sx={{ marginBottom: '1rem' }}
      autoFocus
    />
  )

  const dialog = (
    <Dialog open={isDialogOpen} onClose={closeDialog}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {entered ? (
            dialogMsg
          ) : (
            <Box sx={{ display: 'grid' }}>
              {passwordField}
              {confirmPasswordField}
            </Box>
          )}
          {isLoading ? (
            <LinearProgress />
          ) : (
            <Button onClick={handleSubmit}>OK</Button>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  )

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      width={'50%'}
      margin={'auto'}
      border={'solid #e2f0f1 2px'}
      borderRadius={'5%'}
      padding={'50px 100px'}
    >
      <AccountCircleIcon sx={{ fontSize: 150, margin: 'auto' }} />
      <Typography variant={'h4'} sx={{ padding: '2rem 0', margin: 'auto' }}>
        {username}
      </Typography>
      <Button
        onClick={handleOnClick}
        variant="contained"
        sx={{ textTransform: 'none', fontSize: '1.5rem' }}
      >
        Change Password
      </Button>
      {dialog}
    </Box>
  )
}

export default Profile
