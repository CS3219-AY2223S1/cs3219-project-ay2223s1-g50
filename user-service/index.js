import app from './app.js';
import db from './db.js';

db.open().then(() => {
  const port = 8080;

  app.listen(port, () => {
    console.log("Running app on port " + port);
  });
});


