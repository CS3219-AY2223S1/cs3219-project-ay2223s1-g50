import React from 'react'

const Timer = ({ startTime = 0 }) => {
  const [seconds, setSeconds] = React.useState(
    startTime === 0 ? 0 : Math.floor(Date.now() / 1000) - Number(startTime)
  )

  React.useEffect(() => {
    const myTimeout = setInterval(() => {
      setSeconds((prev) => {
        return prev + 1
      })
    }, 1000)

    return () => {
      clearInterval(myTimeout)
    }
  }, [])

  return (
    <h1>
      {Math.floor(seconds / 60)}:{('0' + (seconds % 60)).slice(-2)}
    </h1>
  )
}

export default Timer
