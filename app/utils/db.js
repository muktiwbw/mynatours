require('dotenv').config();
const mongoose = require('mongoose');

const getMongoDBConnectionString = () => {
  return `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`
};

mongoose.connect(getMongoDBConnectionString(), { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('Connection to database is established...');
}).catch((error) => {
  console.log('Error connecting to database!', error);
});

module.exports = mongoose;