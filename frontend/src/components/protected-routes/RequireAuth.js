import React from 'react'
import axios from 'axios'
import { URL_VALIDATE_SESSION_SVC } from '../../configs'
import { Navigate, Outlet } from 'react-router-dom'
import { UserContext } from '../context/user-context'
import LoadingPage from '../LoadingPage'

axios.defaults.withCredentials = true

const RequireAuth = () => {
  const firstRender = React.useRef(true)
  const [isLoggedIn, setIsLoggedIn] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const userContext = React.useContext(UserContext)

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
    } else {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  React.useEffect(() => {
    const checkSession = async () => {
      axios.get(URL_VALIDATE_SESSION_SVC).then((res) => {
        if (res.data.loggedIn) {
          userContext.setUsername(res.data.username)
          userContext.setToken(res.data.token)
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      })
    }
    checkSession()
    return () => {}
  }, [])

  return isLoading ? (
    <LoadingPage />
  ) : isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  )
}

export default RequireAuth
