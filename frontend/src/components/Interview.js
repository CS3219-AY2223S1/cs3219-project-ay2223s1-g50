import React from 'react'
import { Box, Button, Typography, TextareaAutosize } from '@mui/material'
import { UserContext } from './context/user-context'
import {
  URL_GET_TWO_QUESTIONS_BY_DIFF_QUESTION_SVC,
  URI_COLLABORATION_SVC,
} from '../configs'
import Timer from './ui/Timer'
import axios from 'axios'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { io as Client } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const Interview = () => {
  const userContext = React.useContext(UserContext)
  const [questionOneTitle, setQuestionOneTitle] = React.useState('')
  const [questionOneBody, setQuestionOneBody] = React.useState('')
  const [questionOneExample, setQuestionOneExample] = React.useState('')
  const [questionTwoTitle, setQuestionTwoTitle] = React.useState('')
  const [questionTwoBody, setQuestionTwoBody] = React.useState('')
  const [questionTwoExample, setQuestionTwoExample] = React.useState('')
  const token = userContext.token
  const { difficulty, roomId } = useParams()

  const client = new Client(URI_COLLABORATION_SVC, {
    extraHeaders: {
      Authorization: 'Bearer ' + token,
    },
  })

  // TODO
  // Set roomId given by matching service
  React.useEffect(() => {
    client.emit('collaboration:join_room', {
      roomId,
    })
  })

  client.on('collaboration:room_message', ({ from, message }) => {
    console.log(message)
  })

  const getNewQuestion = async (difficulty) => {
    const config = {
      headers: {
        authorization: 'Bearer ' + token,
      },
    }

    try {
      const res = await axios.post(
        URL_GET_TWO_QUESTIONS_BY_DIFF_QUESTION_SVC,
        { difficulty },
        config
      )
      const questionOne = res.data.questionOne[0]
      const questionTwo = res.data.questionTwo[0]

      setQuestionOneTitle(questionOne.name)
      setQuestionOneBody(questionOne.description)
      setQuestionOneExample(questionOne.examples)
      setQuestionTwoTitle(questionTwo.name)
      setQuestionTwoBody(questionTwo.description)
      setQuestionTwoExample(questionTwo.examples)
    } catch (error) {
      alert(error.data.error)
    }
  }

  // TODO
  // Change difficulty based on matching service (from user-context)
  React.useEffect(() => {
    getNewQuestion(difficulty)
  })

  return (
    <Box sx={{ margin: '4rem' }}>
      <Box
        sx={{ display: 'flex', flexDirection: 'row', padding: '0 0 2rem 0' }}
      >
        <Typography variant={'h4'} sx={{ padding: '0 1rem 0 0' }}>
          Coding Question
        </Typography>
        <Button
          sx={{ fontSize: '1rem' }}
          variant="outlined"
          onClick={() => getNewQuestion('easy')}
        >
          GO NEXT
        </Button>
        <AccessTimeIcon sx={{ fontSize: '3rem', margin: '0 0.5rem 0 1rem' }} />
        <Timer />
      </Box>
      <Box
        sx={{
          border: 'solid black 2px',
          borderRadius: '1%',
          minWidth: '100%',
          padding: 5,
        }}
      >
        <Typography sx={{ whiteSpace: 'pre-line' }}>
          <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
            {questionOneTitle}
          </Typography>
          <Typography sx={{ width: '80%', margin: '1.5rem 0' }}>
            {questionOneBody}
          </Typography>
          {questionOneExample}
        </Typography>
      </Box>
      <Box
        sx={{
          border: 'solid black 2px',
          borderRadius: '1%',
          minWidth: '100%',
          padding: 5,
          marginTop: '1rem',
        }}
      >
        <Typography sx={{ whiteSpace: 'pre-line' }}>
          <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
            {questionTwoTitle}
          </Typography>
          <Typography sx={{ width: '80%', margin: '1.5rem 0' }}>
            {questionTwoBody}
          </Typography>
          {questionTwoExample}
        </Typography>
      </Box>
      <Typography variant={'h4'} sx={{ padding: '2rem 0 0 0' }}>
        Code Editor
      </Typography>
      <TextareaAutosize
        // TODO
        // UPDATE ROOM NUMBER
        onChange={(e) => {
          client.emit('collaboration:room_message', {
            roomId: '1',
            message: e.target.value,
          })
        }}
        aria-label="empty textarea"
        placeholder="Type your code here"
        style={{ minWidth: '100%', minHeight: 500, marginTop: '1rem' }}
      />
    </Box>
  )
}

export default Interview
