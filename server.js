require('dotenv').config();
const app = require('./app/app');

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  console.log(`Listening to ${process.env.APP_HOST}:${process.env.APP_PORT}...`)
});