import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import '@testing-library/jest-dom'
import LoginPage from '../LoginPage'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'

describe('Testing LoginPage component...', () => {
  test('should render LoginPage without crashing', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Login to PeerPrep')).toBeInTheDocument()
    const links = await screen.getAllByRole('link')
    const buttons = await screen.getAllByRole('button')
    const username = screen.getByTestId('login-page-username')
    const password = screen.getByTestId('login-page-password')

    expect(links).toHaveLength(1)
    expect(buttons).toHaveLength(1)

    expect(links[0]).toHaveTextContent(
      "Don't have an account? Click here to register"
    )
    expect(buttons[0]).toHaveTextContent('Login')
    expect(username).toHaveTextContent('Username')
    expect(password).toHaveTextContent('Password')

    //TODO
    //Test user inputs
  })
})
