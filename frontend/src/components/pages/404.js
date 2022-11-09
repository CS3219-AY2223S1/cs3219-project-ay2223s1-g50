import classes from './404.module.css'

const PageNotFound = () => {
  return (
    <div data-testid="page-not-found" className={classes.container}>
      <h1 className={classes.title}>
        4
        <img
          className={classes.image}
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkqTCEe8NPl1pHhHt1DFy1OMtldq3P_RQ0qA&usqp=CAU"
        />
        4
      </h1>
      <h2>Page not found</h2>
      <h3>The page you requested could not be found</h3>
    </div>
  )
}

export default PageNotFound
