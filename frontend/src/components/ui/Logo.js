import { Typography } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsersLine } from '@fortawesome/free-solid-svg-icons'

const Logo = (props) => {
  return (
    <Typography variant={props.size} margin={props.margin}>
      <FontAwesomeIcon icon={faUsersLine} /> PeerPrep
    </Typography>
  )
}

export default Logo
