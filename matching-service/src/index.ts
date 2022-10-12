import { app } from './app'

const port = process.env.EXPRESS_PORT || 5000

app.listen(port, () => {
  console.log(`App is live at port ${port}`)
})
