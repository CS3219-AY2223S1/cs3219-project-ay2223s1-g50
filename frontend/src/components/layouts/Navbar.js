import React from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import axios from 'axios'
import Cookies from 'js-cookie'
import Dropdown from 'react-bootstrap/Dropdown'
import NavDropdown from 'react-bootstrap/NavDropdown'

import { UserContext } from '../context/user-context'
import { URL_LOGOUT_USER_SVC } from '../../configs'
import { COOKIE_INTERVIEW_SESSION } from '../../constants'
import Logo from '../ui/Logo'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'

const NavBar = () => {
  const userContext = React.useContext(UserContext)
  const username = userContext.username
  const token = userContext.token

  const logoLink = token ? '/signup' : '/about'

  const handleLogout = async () => {
    Cookies.remove('token')
    Cookies.remove(COOKIE_INTERVIEW_SESSION)
    userContext.setUsername(null)
    userContext.setToken(null)
    await axios.post(
      URL_LOGOUT_USER_SVC,
      {},
      { headers: { authorization: `Bearer ${userContext.token}` } }
    )
  }

  const dropDown = (
    <Dropdown>
      <Dropdown.Toggle size="lg" variant="primary" id="dropdown-basic">
        {username}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="/profile">Change Password</Dropdown.Item>
        <NavDropdown.Divider />
        <Dropdown.Item href="/" onClick={handleLogout}>
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )

  return (
    <div data-testid="navbar">
      <Navbar bg="dark" variant="dark" className="py-3">
        <Container>
          <Navbar.Brand href={logoLink}>
            <Logo size="h4" />
          </Navbar.Brand>
          <Nav className="justify-content-end">
            {username && dropDown}
            {!username && (
              <>
                <Nav.Link href="/login">
                  <Button variant="outline-light">
                    <h4>Login</h4>
                  </Button>
                </Nav.Link>
                <Nav.Link href="/signup">
                  <Button variant="light">
                    <h4>Sign Up</h4>
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>
    </div>
  )
}

export default NavBar
