import { Typography, Box } from '@mui/material'
import LooksOneIcon from '@mui/icons-material/LooksOne'
import LooksTwoIcon from '@mui/icons-material/LooksTwo'
import Looks3Icon from '@mui/icons-material/Looks3'
import MyAccordion from '../ui/MyAccordion'

const whatIsPeerPrep = (
  <Box
    sx={{
      textAlign: 'left',
      display: 'flex',
      padding: '100px 200px 0',
      justifyContent: 'space-between',
    }}
  >
    <Box
      component="img"
      sx={{ height: '350px', width: '475px', margin: 'auto' }}
      src="https://www.cointribune.com/app/uploads/2021/08/dogecoin.jpg?nowebp"
    />
    <Box sx={{ margin: 'auto' }}>
      <Typography variant="h2">What is PeerPrep?</Typography>
      <Typography variant="h5" sx={{ width: '450px', lineHeight: '50px' }}>
        PeerPrep is Singapore's #1 online platform for users to prepare for
        online coding interviews. Users can role play as the interviewer or the
        interviewee in a simulated online coding interview environment.
      </Typography>
    </Box>
  </Box>
)

/** START OF SECTION TWO COMPONENTS */
const stepOneAccordion = (
  <MyAccordion
    accordionTitle={
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LooksOneIcon sx={{ fontSize: '80px' }} />
        <Typography variant="h4" fontSize="40px">
          Choose a difficulty level
        </Typography>
      </Box>
    }
    accordionDetails={
      <Typography variant="h5">
        Select from 3 difficulties: easy, medium or hard
      </Typography>
    }
  />
)

const stepTwoAccordion = (
  <MyAccordion
    accordionTitle={
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LooksTwoIcon sx={{ fontSize: '80px' }} />
        <Typography variant="h4" fontSize="40px">
          Find a match
        </Typography>
      </Box>
    }
    accordionDetails={
      <Typography variant="h5">
        PeerPrep will match you with another user
      </Typography>
    }
  />
)
const stepThreeAccordion = (
  <MyAccordion
    accordionTitle={
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Looks3Icon sx={{ fontSize: '80px' }} />
        <Typography variant="h4" fontSize="40px">
          Showcase your skills
        </Typography>
      </Box>
    }
    accordionDetails={
      <Typography variant="h5">
        Once you have a match, you can showcase your skills in solving the
        coding problems
      </Typography>
    }
  />
)

const howDoesPeerPrepWorks = (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      background: 'cyan',
      height: '500px',
      marginTop: '4rem',
    }}
  >
    <Box sx={{ margin: 'auto' }}>
      <Typography
        sx={{
          width: '300px',
          backgroundColor: 'black',
          color: 'white',
          padding: '1rem 2rem',
          display: 'inline-block',
          borderRadius: '10px',
          verticalAlign: 'middle',
        }}
        variant="h2"
      >
        How does PeerPrep works?
      </Typography>
    </Box>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: 'auto',
      }}
    >
      {stepOneAccordion}
      {stepTwoAccordion}
      {stepThreeAccordion}
    </Box>
  </Box>
)
/** END OF SECTION TWO COMPONENTS */

const AboutPage = () => {
  return (
    <Box style={{ textAlign: 'center' }} padding="rem">
      {whatIsPeerPrep}
      {howDoesPeerPrepWorks}
    </Box>
  )
}

export default AboutPage
