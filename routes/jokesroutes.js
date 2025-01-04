const express = require("express");
let router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Chiste:
 *       type: object
 *       required:
 *         - id
 *         - texto
 *         - puntaje
 *         - categoria
 *       properties:
 *         id:
 *           type: string
 *           description: Otorgado automáticamente por mongoDB.
 *           readOnly: true
 *         texto:
 *           type: string
 *           description: Texto del chiste.
 *         author:
 *           type: string
 *           description: Nombre de quien escribió el chiste.
 *         puntaje:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Puntaje del 1 al 10 para saber que tan bueno es el chiste.
 *         categoria:
 *           type: string
 *           enum: [Dad joke, Humor Negro, Chistoso, Malo]
 *           description: Categoría del chiste.
 *       example:
 *         id: d5fE_asz
 *         texto: What did the mountain climber name his son? Cliff.
 *         author: icanhazdadjoke.com
 *         puntaje: 1
 *         categoria: Dad joke
 * tags:
 *   name: Chistes
 *   description: API Chistes
 */

async function getChuckJoke(params) {
    let httpResponse = await fetch("https://api.chucknorris.io/jokes/random");
    let jsonResponse = await httpResponse.json()
    return {
        id: jsonResponse.id,
        texto: jsonResponse.value,
        author: "api.chucknorris.io",
        puntaje: 4,
        categoria: "Malo",
    }
}

async function getDadJoke(params) {
    let httpResponse = await fetch("https://icanhazdadjoke.com/", {
        headers: {
            "Accept": "application/json"
        }
    });
    let jsonResponse = await httpResponse.json()
    return {
        id: jsonResponse.id,
        texto: jsonResponse.joke,
        author: "icanhazdadjoke.com",
        puntaje: 1,
        categoria: "Dad joke",
    }
}

async function getOwnJoke(params) {
    return null;
}

/**
 * @swagger
 * /chistes/{tipo}:
 *   get:
 *     summary: Obtener un Chiste
 *     tags: [Chistes]
 *     parameters:
 *       - in: path
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Chuck, Dad, Propio]
 *         required: true
 *         description: Fuente de chiste
 *     responses:
 *       200:
 *         description: The created book.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chiste'
 *       422:
 *         description: tipo es Propio y no hay chistes en la BD
 *       400:
 *         description: tipo no es Chuck, Dad o Propio (tipo de chiste no válido).
 */
router.get("/chistes/:tipo", async (req, res) => {
    const { tipo } = req.params;
    if (tipo === "Chuck") {
        const chiste = await getChuckJoke();
        res.json(chiste);
    } else if (tipo === "Dad") {
        const chiste = await getDadJoke();
        res.json(chiste);
    } else if (tipo === "Propio") {
        const chiste = await getOwnJoke();
        if (chiste) {
            res.json(chiste);
        } else {
            res.status(422).json({ message: "Aun no hay chistes, cree uno!" });
        }
    } else {
        res.status(400).json({ message: "Tipo de chiste no válido" });
    }
});

module.exports = router;