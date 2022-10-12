import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import React from 'react'
import { useState } from 'react'
import { URI_MATCHING_SVC } from '../configs'
import { UserContext } from './context/user-context'
import { useNavigate } from 'react-router-dom'
import { io as Client } from 'socket.io-client'

function Dashboard() {
  const navigate = useNavigate()
  const userContext = React.useContext(UserContext)
  const [isDashboardDialogOpen, setIsDashboardDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMsg, setDialogMsg] = useState('')
  const [questionDifficulty, setQuestionDifficulty] = useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const token = userContext.token
  const MatchEvents = {
    FindMatch: 'find_match',
    MatchFound: 'match_found',
    CancelFindMatch: 'cancel_find_match',
  }
  const client = new Client(URI_MATCHING_SVC, {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  })

  const Difficulty = {
    Easy: 'Easy',
    Medium: 'Medium',
    Hard: 'Hard',
  }
  const difficultyButtons = Object.values(Difficulty).map((difficulty) => (
    <Box display={'flex'} flexDirection={'column'} key={difficulty}>
      <Button
        variant={'outlined'}
        onClick={() => selectQuestionDifficulty(difficulty)}
        disabled={isLoading}
      >
        {difficulty}
      </Button>
    </Box>
  ))

  const selectQuestionDifficulty = (difficulty) => {
    setIsLoading(true)
    setQuestionDifficulty(difficulty)
    client.emit(MatchEvents.FindMatch, {
      difficulty,
    })
  }

  client.on(MatchEvents.MatchFound, ({ roomId }) => {
    console.log(`Received match found: ${questionDifficulty}, room: ${roomId}`)
    navigate(`/interview/${questionDifficulty}/${roomId}`)
  })

  const closeDialog = () => setIsDashboardDialogOpen(false)

  const dashboardDialog = (
    <Dialog open={isDashboardDialogOpen} onClose={closeDialog}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogMsg}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Done</Button>
      </DialogActions>
    </Dialog>
  )

  const setErrorDialog = (msg) => {
    setIsDashboardDialogOpen(true)
    setDialogTitle('Error')
    setDialogMsg(msg)
  }

  return (
    <Box
      display={'flex'}
      alignitems={'center'}
      flexDirection={'column'}
      flexShrink={'0'}
      width={'100%'}
      alignment={'center'}
      justifyContent={'center'}
    >
      <Typography
        variant={'h3'}
        marginBottom={'2rem'}
        display={'flex'}
        alignitems={'center'}
      >
        Welcome
      </Typography>
      <Typography variant={'subtitle1'} marginBottom={'2rem'}>
        Please select your difficulty level
      </Typography>

      {difficultyButtons}
      {dashboardDialog}
    </Box>
  )
}

export default Dashboard
