require('dotenv').config();
const app = require('./app/app');

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.APP_PORT}...`)
});