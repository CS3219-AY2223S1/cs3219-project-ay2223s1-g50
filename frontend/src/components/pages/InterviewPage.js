import React, { useEffect, useState, useContext } from 'react'
import {
  Box,
  Badge,
  Button,
  ButtonGroup,
  Typography,
  TextareaAutosize,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Avatar,
  Stack,
  Card,
  CardHeader,
  CardContent,
  TextField,
  IconButton,
} from '@mui/material'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Badge_bs from 'react-bootstrap/Badge'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Cookies from 'js-cookie'

import { UserContext } from '../context/user-context'
import { URI_COLLABORATION_SVC, URI_CHAT_SVC } from '../../configs'
import Timer from '../ui/Timer'
import { io as Client } from 'socket.io-client'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  COOKIE_INTERVIEW_SESSION,
  PREFIX_COOKIE_MESSAGES,
  PREFIX_COOKIE_MESSAGES_COUNT,
  PREFIX_COOKIE_EDITOR_TEXT,
} from '../../constants'

const Interview = () => {
  let { username, token } = useContext(UserContext)
  const navigate = useNavigate()
  const [swap, setSwap] = useState(true)
  const [isUserLeft, setIsUserLeft] = useState(false) // This state is used to trigger open/close dialog
  const [_isUserLeft, _setIsUserLeft] = useState(false) // This state is used to trigger join/leave event
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [editorText, setEditorText] = useState(() => {
    const text = Cookies.get(PREFIX_COOKIE_EDITOR_TEXT)
    return text ? text : ''
  })

  const { difficulty, roomId } = useParams()
  const {
    state: { questions },
  } = useLocation()

  /// Collab client stuff
  const [usersInRoom, setUsersInRoom] = useState([])
  const [collabClient, setCollabClient] = useState(undefined)
  const CollaborationEvent = {
    RoomMessage: 'collaboration:room_message',
    JoinRoom: 'collaboration:join_room',
    LeaveRoom: 'collaboration:leave_room',
  }
  useEffect(() => {
    const tempCollabClient = new Client(URI_COLLABORATION_SVC, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })

    setCollabClient(tempCollabClient)
    tempCollabClient.emit(CollaborationEvent.JoinRoom, { roomId })
    tempCollabClient.on(CollaborationEvent.RoomMessage, ({ from, message }) => {
      setEditorText(message)
    })
    const setNewUsers = ({ users }) => {
      _setIsUserLeft(false)
      setIsUserLeft(false)
      return setUsersInRoom(users)
    }

    const setRemoveUsers = ({ users }) => {
      _setIsUserLeft(true) // trigger event to emit code editor
      setIsUserLeft(true) // trigger event to open dialog
      return setUsersInRoom(users)
    }
    tempCollabClient.on(CollaborationEvent.JoinRoom, setNewUsers)
    tempCollabClient.on(CollaborationEvent.LeaveRoom, setRemoveUsers)

    return () => {
      tempCollabClient.close()
    }
  }, [])

  /// Re-emit code editor if the other user joins back
  useEffect(() => {
    if (!_isUserLeft) {
      collabClient?.emit(CollaborationEvent.RoomMessage, {
        roomId,
        message: editorText,
      })
    }
  }, [_isUserLeft])

  /// Save state of editortext in browser as cookies
  useEffect(() => {
    Cookies.set(PREFIX_COOKIE_EDITOR_TEXT, editorText)
  }, [editorText])

  /// Dialog to notify if other user has left/ navigated away
  const userLeftDialog = (
    <Dialog open={isUserLeft} onClose={() => setIsUserLeft(false)}>
      <DialogContent>
        <DialogContentText>
          Looks like the other person has navigated away or had left this page.
          <br />
          This window will automatically close if he/she has returned to this
          page.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsUserLeft(false)}>Okay</Button>
      </DialogActions>
    </Dialog>
  )

  /// Difficulty badge
  const difficultyBadge = () => {
    let variant

    switch (difficulty) {
      case 'easy':
        variant = 'success'
        break
      case 'medium':
        variant = 'warning'
        break
      case 'hard':
        variant = 'danger'
        break
      default:
        variant = 'dark'
    }

    return <Badge_bs bg={variant}>{difficulty ?? 'unknown'}</Badge_bs>
  }

  /// Solution button
  const solutionButton = (title) => {
    return (
      <Button
        sx={{
          fontSize: '1rem',
          marginLeft: '2rem',
          backgroundColor: 'black',
        }}
        variant="contained"
        onClick={() =>
          window.open(
            `https://www.google.com/search?q=leetcode+${title}+solution`,
            '_blank'
          )
        }
      >
        SOLUTION
      </Button>
    )
  }

  /// Question boxes
  const questionsBox = (questions) => {
    return (
      <Tabs defaultActiveKey="Question 1" id="questions-tab" className="mb-3">
        {questions?.questionOne?.map((question) => (
          <Tab eventKey="Question 1" title="Question 1">
            {questionBox(
              question.name,
              question.description,
              question.examples
            )}
          </Tab>
        ))}

        {questions?.questionTwo?.map((question) => (
          <Tab eventKey="Question 2" title="Question 2">
            {questionBox(
              question.name,
              question.description,
              question.examples
            )}
          </Tab>
        ))}
      </Tabs>
    )
  }

  /// Layout for question
  const questionBox = (title, body, example) => (
    <Box
      sx={{
        border: 'solid black 2px',
        borderRadius: '1%',
        padding: 5,
        marginBottom: '1rem',
        maxHeight: '340px',
        overflow: 'scroll',
      }}
      key={`${title}${body}`}
    >
      {difficultyBadge()}
      <Typography sx={{ whiteSpace: 'pre-line' }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
          {title}
          {solutionButton(title)}
        </Typography>
        <Typography sx={{ width: '100%', margin: '1.5rem 0' }}>
          {body}
        </Typography>
        {example}
      </Typography>
    </Box>
  )

  /// Getting a new question stuff
  const [questionsShown, setQuestionsShown] = useState({})
  useEffect(() => {
    setQuestionsShown(questions)
  }, [questions])

  const questionTimer = () => {
    const session = Cookies.get(COOKIE_INTERVIEW_SESSION)
    let startTime

    if (session) {
      startTime = JSON.parse(session).startTime
    }

    return (
      <>
        <AccessTimeIcon sx={{ fontSize: '3rem', margin: '0 0.5rem 0 1rem' }} />
        <Timer startTime={startTime} />
      </>
    )
  }

  /// Code editor
  const codeEditor = (
    <TextareaAutosize
      onChange={({ target: { value } }) => {
        collabClient?.emit(CollaborationEvent.RoomMessage, {
          roomId,
          message: value,
        })
        setEditorText(value)
      }}
      aria-label="empty textarea"
      placeholder="Type your code here"
      value={editorText}
      style={{
        flexGrow: '1',
        minHeight: '600px',
        margin: '4rem 1rem',
        padding: '1rem',
        resize: 'horizontal',
      }}
    />
  )

  /// User Avatar stuff
  const userAvatar = (user) => (
    <Tooltip title={user} key={user}>
      <IconButton>
        <Avatar>{user[0]?.toUpperCase()}</Avatar>
      </IconButton>
    </Tooltip>
  )
  const userAvatars = (
    <Stack direction="row" spacing="2">
      {usersInRoom.map(userAvatar)}
    </Stack>
  )

  /// Chat client stuff
  const [messages, setMessages] = useState(() => {
    const prevMessages = Cookies.get(PREFIX_COOKIE_MESSAGES)
    return prevMessages ? JSON.parse(prevMessages) : []
  })
  const ChatEvents = {
    RoomMessage: 'chat:room_message',
    JoinRoom: 'chat:join_room',
    LeaveRoom: 'chat:leave_room',
  }
  const [chatClient, setChatClient] = useState(undefined)
  useEffect(() => {
    const tempChatClient = new Client(URI_CHAT_SVC, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    setChatClient(tempChatClient)
    tempChatClient.emit(ChatEvents.JoinRoom, { roomId })
    tempChatClient.on(ChatEvents.RoomMessage, (msg) => {
      setMessages((currMessages) => {
        const newMessages = [...currMessages, msg]
        Cookies.set(PREFIX_COOKIE_MESSAGES, JSON.stringify(newMessages))
        return newMessages
      })
    })

    return () => {
      tempChatClient.close()
    }
  }, [])

  /// Chat dialog stuff
  const [message, setMessage] = useState('')
  const sendMessage = () => {
    if (message.length === 0) return
    chatClient?.emit(ChatEvents.RoomMessage, {
      roomId,
      message,
    })
    setMessages((prev) => {
      const newMessages = [...prev, { from: username, message }]
      Cookies.set(PREFIX_COOKIE_MESSAGES, JSON.stringify(newMessages))
      return newMessages
    })
    setMessage('')
  }

  const chatMessage = ({ from, message }) => (
    <Card
      key={`${from}${message}`}
      sx={{ display: 'flex', margin: '0.5rem 0' }}
    >
      {/* Message sent by user */}
      {from !== username && <CardHeader avatar={userAvatar(from)} />}
      <CardContent
        sx={{ margin: 'auto', width: '300px', overflowWrap: 'break-word' }}
      >
        {message}
      </CardContent>
      {from === username && <CardHeader avatar={userAvatar(from)} />}{' '}
      {/* Flip icon pos if not sender */}
    </Card>
  )

  const chatBox = (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          maxHeight: '230px',
          overflow: 'auto',
          border: 'black 2px solid',
          borderRadius: '0.3rem',
          height: '230px',
        }}
      >
        {messages.map(chatMessage)}
      </Box>
      <Box sx={{ display: 'flex' }}>
        <TextField
          sx={{ flexGrow: '1' }}
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        ></TextField>
        <Button
          sx={{ marginLeft: '1rem' }}
          onClick={() => sendMessage()}
          variant="contained"
        >
          Send
        </Button>
      </Box>
    </Box>
  )

  /// Leave room stuff
  /// Cleaning up
  const leaveRoom = () => {
    Cookies.remove(COOKIE_INTERVIEW_SESSION)
    Cookies.remove(PREFIX_COOKIE_MESSAGES)
    Cookies.remove(PREFIX_COOKIE_MESSAGES_COUNT)
    Cookies.remove(PREFIX_COOKIE_EDITOR_TEXT)
    navigate('/dashboard', { replace: true })
  }

  const leaveRoomButton = (
    <Button
      sx={{ fontSize: '1rem', marginLeft: 'auto', backgroundColor: 'black' }}
      variant="contained"
      onClick={() => setConfirmLeave(true)}
    >
      <ExitToAppIcon sx={{ margin: '0 5px 0 -5px' }} />
      LEAVE
    </Button>
  )

  const leaveRoomDialog = (
    <Dialog open={confirmLeave} onClose={() => setConfirmLeave(false)}>
      <DialogContent>
        <DialogContentText>Confirm leave room?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmLeave(false)}>No</Button>
        <Button onClick={() => leaveRoom()}>Yes</Button>
      </DialogActions>
    </Dialog>
  )

  const swapDisplayButton = (
    <Button
      sx={{
        backgroundColor: 'black',
        margin: '0 20px',
      }}
      variant="contained"
      onClick={() => setSwap((prev) => !prev)}
    >
      SWAP DISPLAY
    </Button>
  )

  // code to run on window close
  return (
    <Box sx={{ margin: '4rem' }}>
      <Box
        sx={{ display: 'flex', flexDirection: 'row', padding: '0 0 2rem 0' }}
      >
        {userAvatars}
        {questionTimer()}
        <ButtonGroup
          sx={{ marginLeft: 'auto' }}
          variant="text"
          aria-label="text button group"
        >
          {swapDisplayButton}
          {leaveRoomButton}
        </ButtonGroup>
      </Box>
      {/* TODO: Try to figure out why this doesn't change when questionsShown changes */}
      <Box sx={{ display: 'flex' }}>
        {swap && (
          <>
            {codeEditor}
            <Box sx={{ width: "50%", minWidth: "30%" }}>
              {questionsBox(questionsShown)}
              {chatBox}
            </Box>
          </>
        )}
        {!swap && (
          <>
            <Box sx={{ width: "50%", minWidth: "30%" }}>
              {questionsBox(questionsShown)}
              {chatBox}
            </Box>
            {codeEditor}
          </>
        )}
      </Box>
      {userLeftDialog}
      {leaveRoomDialog}
    </Box>
  )
}

export default Interview
