import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const LoadingPage = () => {
  return (
    <div data-testid="loading-page">
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
        <h1>Loading...</h1>
        <CircularProgress />
      </Box>
    </div>
  )
}

export default LoadingPage
