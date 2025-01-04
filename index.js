const express = require("express"),
    bodyParser = require("body-parser"),
    swaggerJsdoc = require("swagger-jsdoc"),
    swaggerUi = require("swagger-ui-express");

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