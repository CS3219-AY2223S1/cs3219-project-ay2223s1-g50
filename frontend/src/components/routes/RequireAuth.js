import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import LoadingPage from '../pages/LoadingPage'
import ValidateAuth from '../hooks/ValidateAuth'

const RequireAuth = () => {
  const firstRender = React.useRef(true)
  const [isLoggedIn, setIsLoggedIn] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
    } else {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  ValidateAuth((isLoggedIn) => setIsLoggedIn(isLoggedIn))

  return isLoading ? (
    <LoadingPage />
  ) : isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  )
}

export default RequireAuth
