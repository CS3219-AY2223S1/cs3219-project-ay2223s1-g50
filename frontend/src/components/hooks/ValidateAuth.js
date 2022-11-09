import { useEffect, useContext } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'

import { UserContext } from '../context/user-context'
import { URL_VALIDATE_SESSION_SVC } from '../../configs'

const ValidateAuth = (setIsLoggedIn) => {
  const userContext = useContext(UserContext)

  useEffect(() => {
    const token = Cookies.get('token')
    const config = {
      headers: {
        authorization: 'Bearer ' + token,
      },
    }
    const validateToken = async () => {
      axios
        .post(URL_VALIDATE_SESSION_SVC, {}, config)
        .then((res) => {
          userContext.setUsername(res.data.username)
          userContext.setToken(token)
          setIsLoggedIn(true)
        })
        .catch((error) => {
          console.error(error.message)
          setIsLoggedIn(false)
        })
    }

    validateToken()

    return () => {}
  }, [])
}

export default ValidateAuth
