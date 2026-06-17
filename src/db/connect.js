const mongoose = require('mongoose');
const config = require('../config');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log(`[db] connected to MongoDB at ${config.mongoUri}`);
  return mongoose.connection;
}

module.exports = connectDB;
