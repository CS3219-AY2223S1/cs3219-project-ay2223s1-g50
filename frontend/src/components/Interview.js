import React, { useEffect, useState, useContext } from 'react'
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
import { useLocation, useParams } from 'react-router-dom'

const Interview = () => {
  const userContext = useContext(UserContext)
  const token = userContext.token

  const [questionsShown, setQuestionsShown] = useState({})
  const [editorText, setEditorText] = useState('')

  const { difficulty, roomId } = useParams()
  const {
    state: { questions },
  } = useLocation()

  const CollaborationEvent = {
    RoomMessage: 'collaboration:room_message',
    JoinRoom: 'collaboration:join_room',
  }
  const client = new Client(URI_COLLABORATION_SVC, {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  })

  useEffect(() => {
    client.emit(CollaborationEvent.JoinRoom, {
      roomId,
    })
  })

  useEffect(() => {
    setQuestionsShown(questions)
  }, [questions])

  client.on(CollaborationEvent.RoomMessage, ({ from, message }) => {
    setEditorText(message)
  })

  const questionsBox = (questions) => (
    <>
      {questions?.questionOne?.map((question) =>
        questionBox(question.name, question.description, question.examples)
      )}
      {questions?.questionTwo?.map((question) =>
        questionBox(question.name, question.description, question.examples)
      )}
    </>
  )

  const questionBox = (title, body, example) => (
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
          {title}
        </Typography>
        <Typography sx={{ width: '80%', margin: '1.5rem 0' }}>
          {body}
        </Typography>
        {example}
      </Typography>
    </Box>
  )

  const getNewQuestion = async () => {
    const config = {
      headers: {
        authorization: 'Bearer ' + token,
      },
    }

    try {
      const { data: res } = await axios.post(
        URL_GET_TWO_QUESTIONS_BY_DIFF_QUESTION_SVC,
        { difficulty },
        config
      )
      setQuestionsShown(res)
    } catch (error) {
      console.error({ error })
    }
  }

  // Removed this until we add syncing up of questions through collab service
  // technology is not there yet :') LOL
  const goNextButton = (
    <Button
      sx={{ fontSize: '1rem' }}
      variant="outlined"
      onClick={() => getNewQuestion()}
    >
      GO NEXT
    </Button>
  )

  return (
    <Box sx={{ margin: '4rem' }}>
      <Box
        sx={{ display: 'flex', flexDirection: 'row', padding: '0 0 2rem 0' }}
      >
        <Typography variant={'h4'} sx={{ padding: '0 1rem 0 0' }}>
          Coding Question
        </Typography>
        {/* goNextButton was here */}
        <AccessTimeIcon sx={{ fontSize: '3rem', margin: '0 0.5rem 0 1rem' }} />
        <Timer />
      </Box>
      {/* TODO: Try to figure out why this doesn't change when questionsShown changes */}
      {questionsBox(questionsShown)}
      <Typography variant={'h4'} sx={{ padding: '2rem 0 0 0' }}>
        Code Editor
      </Typography>
      <TextareaAutosize
        onChange={(e) => {
          client.emit(CollaborationEvent.RoomMessage, {
            roomId,
            message: e.target.value,
          })
        }}
        aria-label="empty textarea"
        placeholder="Type your code here"
        value={editorText}
        style={{ minWidth: '100%', minHeight: 500, marginTop: '1rem' }}
      />
    </Box>
  )
}

export default Interview
