require('dotenv').config();
const app = require('./app/app');

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}...`)
});

// * Listening to SIGTERM signal from Heroku 
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down server...');

  server.close(() => {
    console.log('Process terminated. Server is asleep.');
  });
});