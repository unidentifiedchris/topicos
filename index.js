const mongoose = require("mongoose");

const DB_USER = process.env.MONGO_USERNAME,
    DB_PASS = process.env.MONGO_PASSWORD,
    DB_HOST = process.env.MONGO_HOSTNAME,
    DB_PORT = process.env.MONGO_PORT,
    DB_NAME = process.env.MONGO_DB;

mongoose.set("strictQuery", false);
mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`);

const app = require("./app");

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
