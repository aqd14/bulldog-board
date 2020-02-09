const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local'});
// const config = require('config');

const db = process.env.MONGOOSE_URI; // config.get("mongoURI");

const connectDB = async () => {
    try {
        await mongoose.connect(db, 
            {
                useCreateIndex: true,
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify: false
            });
        console.log("MongodB Connected...");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;