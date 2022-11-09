import { Box, Button, Typography } from '@mui/material'

const Card = (props) => {
  return (
    <Box
      sx={{
        margin: '0 1rem',
        padding: '2rem',
        height: '500px',
        width: '300px',
        border: 'solid black 2px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant={'h3'}>{props.difficulty}</Typography>
      <Box
        component="img"
        sx={{
          borderRadius: '50%',
          height: '150px',
          width: '150px',
          margin: 'auto',
        }}
        src={props.img}
      />
      <Typography>{props.description}</Typography>
      <Button
        disabled={props.disabled}
        onClick={props.onClick}
        variant={'contained'}
        sx={{ marginTop: '2rem', width: '80%' }}
      >
        SELECT
      </Button>
    </Box>
  )
}

export default Card
