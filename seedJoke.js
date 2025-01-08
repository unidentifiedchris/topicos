const mongoose = require("mongoose");
const { ChistePropio } = require("./models/jokeModel");

const DB_USER = process.env.MONGO_USERNAME,
    DB_PASS = process.env.MONGO_PASSWORD,
    DB_HOST = process.env.MONGO_HOSTNAME,
    DB_PORT = process.env.MONGO_PORT,
    DB_NAME = process.env.MONGO_DB;

mongoose.set("strictQuery", false);
mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`);

async function seedDatabase() {
    const jokes = [
        { texto: "Joke 1", author: "Author 1", puntaje: 1, categoria: "Malo" },
        { texto: "Joke 2", author: "Author 2", puntaje: 5, categoria: "Chistoso" },
        { texto: "Joke 3", author: "Author 3", puntaje: 10, categoria: "Humor Negro" }
    ];

    try {
        await ChistePropio.insertMany(jokes);
        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();
