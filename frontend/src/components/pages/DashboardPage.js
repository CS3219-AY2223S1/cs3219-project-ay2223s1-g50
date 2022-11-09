import { URI_MATCHING_SVC } from '../../configs'
import {
  COOKIE_INTERVIEW_SESSION,
  PREFIX_COOKIE_MESSAGES,
  PREFIX_COOKIE_MESSAGES_COUNT,
} from '../../constants'
import { UserContext } from '../context/user-context'
import Card from '../ui/Card'
import Timer from '../ui/Timer'
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
} from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect } from 'react'
import { useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import { useNavigate } from 'react-router-dom'
import { io as Client } from 'socket.io-client'

function Dashboard() {
  const navigate = useNavigate()
  const userContext = React.useContext(UserContext)
  const token = userContext.token

  const [isFindingMatch, setIsFindingMatch] = useState(false)
  const [timeoutIds, setTimeoutIds] = React.useState([])
  const [noMatch, setNoMatch] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)

  const MATCHMAKING_TIME = 30000 // 30 seconds

  const MatchEvents = {
    FindMatch: 'find_match',
    MatchFound: 'match_found',
    CancelFindMatch: 'cancel_find_match',
  }
  const [matchingClient, setMatchingClient] = useState(undefined)
  useEffect(() => {
    const tempMatchingClient = new Client(URI_MATCHING_SVC, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    setMatchingClient(tempMatchingClient)

    tempMatchingClient.on(
      MatchEvents.MatchFound,
      async ({ roomId, difficulty, questions }) => {
        Cookies.set(
          COOKIE_INTERVIEW_SESSION,
          JSON.stringify({
            roomId,
            difficulty,
            questions,
            startTime: Math.floor(Date.now() / 1000),
          })
        )

        clearMatchMakingTimeouts()
        navigate(`/interview/${difficulty.toLowerCase()}/${roomId}`, {
          state: { questions },
        })
      }
    )

    return () => {
      tempMatchingClient.close()
    }
  }, [])

  const findMatchWithDifficulty = async (difficulty) => {
    setIsFindingMatch(true)
    setTimeoutIds((prev) => [...matchmakingTimeout()])

    matchingClient?.emit(MatchEvents.FindMatch, {
      difficulty,
    })
  }

  const findMatchWithExistingSession = async (difficulty) => {
    setSelectedDifficulty(difficulty)
    const session = Cookies.get(COOKIE_INTERVIEW_SESSION)

    if (session) {
      setConfirmLeave(true)
    } else {
      findMatchWithDifficulty(difficulty)
    }
  }

  const closeDialog = () => {
    clearMatchMakingTimeouts()
    matchingClient?.emit(MatchEvents.CancelFindMatch)
    setIsFindingMatch(false)
  }

  const matchmakingTimeout = () => {
    const id = setTimeout(closeDialog, MATCHMAKING_TIME) // 30000 = 30 seconds
    const id2 = setTimeout(() => setNoMatch(true), MATCHMAKING_TIME) // 30000 = 30 seconds
    return [id, id2]
  }

  const clearMatchMakingTimeouts = () => {
    timeoutIds.map((id) => clearTimeout(id))
  }

  const dashboardDialog = (
    <Dialog open={isFindingMatch}>
      <Box sx={{ display: 'flex' }}>
        <DialogTitle>Finding a match...</DialogTitle>
        <Box sx={{ marginTop: '0.5rem' }}>
          <Timer />
        </Box>
      </Box>
      <DialogContent>
        <LinearProgress />
        <DialogContentText>
          Please wait while we find you a match
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )

  const closeNoMatchDialog = () => {
    setNoMatch(false)
  }

  const noMatchDialog = (
    <Dialog open={noMatch} onClose={closeNoMatchDialog}>
      <DialogTitle>Unable to find a match</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <DialogContentText>
          Sorry, we could not find a peer for you :(
        </DialogContentText>
        <Box
          sx={{
            height: '100px',
            width: '100px',
            margin: '2rem auto 0 auto',
            borderRadius: '50%',
          }}
          component="img"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkqTCEe8NPl1pHhHt1DFy1OMtldq3P_RQ0qA&usqp=CAU"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeNoMatchDialog}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )

  const returnToInterviewButton = () => {
    const session = Cookies.get(COOKIE_INTERVIEW_SESSION)
    if (!session) return <></>

    let { roomId, difficulty, questions } = JSON.parse(session)

    return (
      <Button
        variant={'contained'}
        sx={{ margin: '2rem', width: '30%' }}
        onClick={() =>
          navigate(`/interview/${difficulty.toLowerCase()}/${roomId}`, {
            state: { questions },
          })
        }
      >
        Return to your previous interview
      </Button>
    )
  }

  const existingSessionDialog = (
    <Dialog open={confirmLeave} onClose={() => setConfirmLeave(false)}>
      <DialogContent>
        <DialogContentText>
          Looks like you already have an existing interview session.
          <br />
          Confirm leave and find a new match?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmLeave(false)}>No</Button>
        <Button
          onClick={() => {
            Cookies.remove(COOKIE_INTERVIEW_SESSION)
            Cookies.remove(PREFIX_COOKIE_MESSAGES)
            Cookies.remove(PREFIX_COOKIE_MESSAGES_COUNT)
            findMatchWithDifficulty(selectedDifficulty)
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Box>
      <Box
        display={'flex'}
        alignItems={'center'}
        flexDirection={'column'}
        flexShrink={'0'}
        width={'100%'}
        alignment={'center'}
        justifyContent={'center'}
        marginTop={'5%'}
      >
        <Typography variant={'h3'} marginBottom={'2rem'}>
          Welcome
        </Typography>
        <Typography variant={'subtitle1'} marginBottom={'2rem'}>
          Please select your difficulty level
        </Typography>
        {returnToInterviewButton()}
        <Box display={'flex'} sx={{ padding: ' 0 40%' }}>
          <Card
            difficulty={<Badge bg="success">Easy</Badge>}
            description="This difficulty is suitable for those who are getting started"
            img="https://cdn-icons-png.flaticon.com/512/2641/2641391.png"
            onClick={() => findMatchWithExistingSession('Easy')}
            disabled={isFindingMatch}
          />
          <Card
            difficulty={<Badge bg="warning">Medium</Badge>}
            description="This difficulty is suitable for those who wants to ramp up their skills"
            img="https://en.scratch-wiki.info/w/images/thumb/ScratchCat-Small.png/200px-ScratchCat-Small.png"
            onClick={() => findMatchWithExistingSession('Medium')}
            disabled={isFindingMatch}
          />
          <Card
            difficulty={<Badge bg="danger">Hard</Badge>}
            description="This difficulty is for those who wants to work in FAANG"
            img="https://assets.entrepreneur.com/content/3x2/2000/20150224165308-jeff-bezos-amazon.jpeg?crop=4:3"
            onClick={() => findMatchWithExistingSession('Hard')}
            disabled={isFindingMatch}
          />
        </Box>
        {dashboardDialog}
        {noMatchDialog}
        {existingSessionDialog}
      </Box>
    </Box>
  )
}

export default Dashboard
