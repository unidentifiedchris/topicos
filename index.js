const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    swaggerJsdoc = require("swagger-jsdoc"),
    swaggerUi = require("swagger-ui-express");

const DB_USER = process.env.MONGO_USERNAME,
    DB_PASS = process.env.MONGO_PASSWORD,
    DB_HOST = process.env.MONGO_HOSTNAME,
    DB_PORT = process.env.MONGO_PORT,
    DB_NAME = process.env.MONGO_DB;
console.log(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME);
mongoose.set("strictQuery", false);
mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`);

const app = express();
const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "ApiChistes",
            version: "0.1.0",
            description: "Proyecto TEP",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);
app.use(bodyParser.json());
app.use(require("./routes/jokesroutes"));

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});