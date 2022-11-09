import renderer from 'react-test-renderer'
import { render, screen, cleanup } from '@testing-library/react'
import PageNotFound from '../PageNotFound'

afterEach(cleanup)

describe('Testing PageNotFound component...', () => {
  test('should render PageNotFound without crashing', () => {
    render(<PageNotFound />)
    const element = screen.getByTestId('page-not-found')
    expect(element).toBeInTheDocument()
  })

  test('should have 3 headings', async () => {
    render(<PageNotFound />)
    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(3)
  })

  test('should have correct heading text', () => {
    render(<PageNotFound />)
    const element = screen.getByTestId('page-not-found')
    expect(element).toHaveTextContent('404')
    expect(element).toHaveTextContent('Page not found')
    expect(element).toHaveTextContent(
      'The page you requested could not be found'
    )
  })

  test('should match PageNotFound snapshot', () => {
    const tree = renderer.create(<PageNotFound />)
    expect(tree).toMatchSnapshot()
  })
})
