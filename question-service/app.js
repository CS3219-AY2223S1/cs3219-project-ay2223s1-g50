import express from 'express'
import cors from 'cors'
import Question from './model/QuestionModel.js'
import DIFFICULTY from './const.js'
import URL from './url.js'
import cookieParser from 'cookie-parser'
import auth from './auth.js'
import 'dotenv/config.js'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(
  cors({
    origin: [URL.FRONTEND_SERVICE_LOCAL_URL],
    credentials: true,
  })
) // config cors so that front-end can use
app.options('*', cors())
app.use(cookieParser())

app.get('/', (_, res) => res.send('Question service is running well!'))

app.post('/get-two-questions-by-diff', async (req, res) => {
  console.log('\nGETTING 2 QUESTIONS BY DIFFICULTY...')

  // TOKEN/ROLE AUTH
  try {
    await auth.validateAccessTokenAndRole(req, auth.ROLES.User)
  } catch (e) {
    console.log(`\nAUTH FAILED: ${JSON.stringify(e)}`)
    if (!e.response) {
      console.log(
        `[GET 2 QUESTIONS BY DIFFICULTY][AUTH] Could not call user service! Error:\n ${e}`
      )
      return res
        .status(500)
        .json({ error: 'Had problem calling user service!' })
    }
    return res.status(e.response.status).json(e.response.data)
  }

  // VALIDATION
  let { difficulty } = req.body
  difficulty = difficulty.toLowerCase()
  if (!difficulty) {
    console.log(
      '[GET 2 QUESTIONS BY DIFFICULTY][VALIDATION] Missing difficulty!'
    )
    return res.status(400).json({
      error: 'Please provide a difficulty level!',
    })
  }
  if (!Object.values(DIFFICULTY).includes(difficulty)) {
    console.log(
      '[GET 2 QUESTIONS BY DIFFICULTY][VALIDATION] Invalid difficulty!'
    )
    return res.status(400).json({
      error: 'Please provide a valid difficulty level (easy, medium, hard)! ',
    })
  }

  // RETRIEVE QUESTIONS
  const questions = await Question.getQuestionsByDifficulty(difficulty)
  if (!questions) {
    console.log(
      `[GET 2 QUESTIONS BY DIFFICULTY][FAILURE] Server could not get questions by difficulty ${difficulty}!`
    )
    return res
      .status(500)
      .json({ error: 'Could not get questions by difficulty!' })
  }
  if (questions.length < 2) {
    console.log(
      `[GET 2 QUESTIONS BY DIFFICULTY][FAILURE] Server could not get at least 2 questions by difficulty ${difficulty}!`
    )
    return res
      .status(500)
      .json({ error: 'Could not get at least 2 questions by difficulty!' })
  }

  const twoQuestions = []
  twoQuestions.push(questions.splice(Math.random() * questions.length, 1))
  twoQuestions.push(questions.splice(Math.random() * questions.length, 1))

  console.log(
    `[GET 2 QUESTIONS BY DIFFICULTY][SUCCESS] Server retrieved questions by ${difficulty} successfully!`
  )
  console.log(twoQuestions)
  return res.status(201).json({
    success: `Retrieved 2 questions by difficulty successfully!`,
    questionOne: twoQuestions[0],
    questionTwo: twoQuestions[1],
  })
})

app.post('/create-question', async (req, res) => {
  console.log('\nCREATING QUESTION...')

  // TOKEN/ROLE AUTH
  try {
    await auth.validateAccessTokenAndRole(req, auth.ROLES.Admin)
  } catch (e) {
    console.log(`\nAUTH FAILED:\n ${JSON.stringify(e)}`)
    if (!e.response) {
      console.log(
        `[GET 2 QUESTIONS BY DIFFICULTY][AUTH] Could not call user service! Error:\n ${e}`
      )
      return res
        .status(500)
        .json({ error: 'Had problem calling user service!' })
    }
    return res.status(e.response.status).json(e.response.data)
  }

  // VALIDATION
  const { name, description, difficulty, examples } = req.body
  if (!name || !description || !difficulty || !examples) {
    console.log(
      '[CREATE][VALIDATION] Missing name/description/difficulty/examples!'
    )
    return res.status(400).json({
      error: 'Please provide name, description, difficulty, and examples!',
    })
  }
  if (!Object.values(DIFFICULTY).includes(difficulty)) {
    console.log(
      '[GET 2 QUESTIONS BY DIFFICULTY][VALIDATION] Invalid difficulty!'
    )
    return res.status(400).json({
      error: 'Please provide a valid difficulty level (easy, medium, hard)! ',
    })
  }

  // CREATE QUESTION
  const newQuestion = await Question.createQuestion(
    name,
    description,
    difficulty,
    examples
  )
  if (!newQuestion) {
    console.log(
      `[CREATE][FAILURE] Server could not create new question ${name}!`
    )
    return res.status(500).json({ error: 'Could not create new question!' })
  }

  console.log(
    `[CREATE][SUCCESS] Server created new question ${name} successfully!`
  )
  console.log(newQuestion)
  return res
    .status(201)
    .json({ success: `Created new question ${name} successfully!` })
})

export default app
