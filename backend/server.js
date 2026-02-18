// THIS IS THE SERVER CONFIG RELATED APP
// DB, ENV ETC.
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = "mongodb://localhost:27017/data";
mongoose
    .connect(DB, {})
    .then(() => {
        console.log('DB Connection Successful');
    })
    .catch((err) => console.log(err.name, err.message));

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Listening at: ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    server.close(() => process.exit(1));
});
