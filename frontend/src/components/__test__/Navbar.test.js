import renderer from 'react-test-renderer'
import { render, screen, cleanup } from '@testing-library/react'
import Navbar from '../layouts/Navbar'

afterEach(cleanup)

describe('Testing Navbar component...', () => {
  test('should render Navbar component without crashing', () => {
    render(<Navbar />)
    const navbarElement = screen.getByTestId('navbar')
    expect(navbarElement).toBeInTheDocument()
  })

  test('should have 4 headings', async () => {
    render(<Navbar />)
    const headings = await screen.findAllByRole('heading')
    expect(headings).toHaveLength(4)
  })

  // TODO
  // Write test case when user is logged in.
  test('should have correct heading text', () => {
    render(<Navbar />)
    const navbarElement = screen.getByTestId('navbar')
    expect(navbarElement).toHaveTextContent('PeerPrep')
    expect(navbarElement).toHaveTextContent('Home')
    expect(navbarElement).toHaveTextContent('Login')
    expect(navbarElement).toHaveTextContent('Sign Up')
  })

  test('should match Navbar snapshot', () => {
    const tree = renderer.create(<Navbar />)
    expect(tree).toMatchSnapshot()
  })
})
