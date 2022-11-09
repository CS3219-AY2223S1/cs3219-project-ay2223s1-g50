import renderer from 'react-test-renderer'
import { render, screen, cleanup } from '@testing-library/react'
import LoadingPage from '../LoadingPage'

afterEach(cleanup)

describe('Testing LoadingPage component...', () => {
  test('should render LoadingPage component without crashing', () => {
    render(<LoadingPage />)
    const loadingPageElement = screen.getByTestId('loading-page')
    expect(loadingPageElement).toBeInTheDocument()
  })

  test('LoadingPage should have loading text', () => {
    render(<LoadingPage />)
    const loadingPageElement = screen.getByTestId('loading-page')
    expect(loadingPageElement).toHaveTextContent('Loading...')
  })

  test('should match LoadingPage snapshot', () => {
    const tree = renderer.create(<LoadingPage />)
    expect(tree).toMatchSnapshot()
  })
})
