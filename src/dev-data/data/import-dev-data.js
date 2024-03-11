const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

// 1) REPLACING PASSWORD IN THE CONECTION STRING
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
    // console.log(con.connection);
    console.log('DB connection successfull!');
  });

// 3) READING JSON FILE

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

// 4) IMPORTING DATA TO DB

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully load!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// 5) DELETE ALL DATA FROM COLLECTION

// console.log(process.argv);

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully removed!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
