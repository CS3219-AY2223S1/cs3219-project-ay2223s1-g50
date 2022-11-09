import classes from './HeroPage.module.css'
import { Button } from '@mui/material'

const Hero = () => {
  return (
    <div className={classes.container}>
      <div className={classes['text-container']}>
        <h1 className={classes.title}>
          Get <span style={{ color: 'salmon' }}>hired</span> at your dream job!
        </h1>
        <h3 className={classes.description}>
          PeerPrep prepares you for online technical interview by increasing
          your technical competence and confident so that you can land your
          dream job.
        </h3>
        <div className={classes['button-container']}>
          <Button
            className={classes['button-learn-more']}
            variant="text"
            href="/about"
            style={{
              border: 'black solid 1px',
              backgroundColor: '#FFFFFF',
              fontSize: '1.3rem',
              width: '45%',
              height: '4rem',
            }}
          >
            LEARN MORE
          </Button>
          <Button
            className={classes['button-sign-up']}
            variant="contained"
            href="/signup"
            style={{ fontSize: '1.3rem', width: '45%', height: '4rem' }}
          >
            SIGN UP
          </Button>
        </div>
      </div>
      <div className={classes['image-container']}>
        <img
          className={classes.image}
          src="https://img.freepik.com/free-vector/man-having-online-job-interview_52683-43379.jpg"
        />
      </div>
    </div>
  )
}

export default Hero
