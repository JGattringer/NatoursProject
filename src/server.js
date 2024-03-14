// This Node.js code connects to a MongoDB database using Mongoose, replaces the password in the connection string, and starts a server to run the application.

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER EXCEPTION,  shutting down...');
  process.exit(1);
});

// 1) REPLACING PASSWORD ON THE CONNECTION STRING
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// 2) CONECTING TO DATABSE
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successfull!');
  });

// 3) STARTING SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION,  shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
