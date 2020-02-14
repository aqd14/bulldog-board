const mongoose = require('mongoose')
// require('dotenv').config({ path: '.env.local'});
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.ENVIRONMENT}`) })

// console.log(path.resolve(__dirname, `../.env.${process.env.ENVIRONMENT}`));

// console.log(process.env.MONGOOSE_URI);

const connectDB = async () => {
  console.log('Connecting MongoDB...')
  await mongoose.connect(process.env.MONGOOSE_URI, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
}

module.exports = connectDB
