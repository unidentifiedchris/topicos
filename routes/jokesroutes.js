const express = require("express");
let router = express.Router();

const { ChistePropio } = require("../models/jokeModel");

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

function chistePropioToJoke(chiste) {
    return {
        id: chiste._id.toString(),
        texto: chiste.texto,
        author: chiste.author,
        puntaje: chiste.puntaje,
        categoria: chiste.categoria,
    };
}

async function getChuckJoke() {
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

async function getDadJoke() {
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

async function getOwnJoke() {
    try {
        const chistes = await ChistePropio.aggregate([
            { $sample: { size: 1 } }
        ]);
        return chistes[0];
    } catch (error) {
        console.log(error);
    }
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
 *         description: Un chiste aleatorio del tipo deseado.
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
            res.json(chistePropioToJoke(chiste));
        } else {
            res.status(422).json({ message: "Aun no hay chistes, cree uno!" });
        }
    } else {
        res.status(400).json({ message: "Tipo de chiste no válido" });
    }
});

/**
 * @swagger
 * /chistes/propio:
 *   post:
 *     summary: Guardar y persistir un chiste propio.
 *     tags: [Chistes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chiste'
 *     responses:
 *       200:
 *         description: El chiste subido con su ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chiste'
 *       400:
 *         description: Formato invalido.
 */
router.post("/chistes/Propio", async (req, res) => {
    if (!req.body) {
        res.status(400).json({ message: "Falta el chiste" });
    }

    const { id, texto, author, puntaje, categoria } = req.body;
    if (id) {
        res.status(400).json({ message: "No se puede especificar un ID" });
    } else if (!texto) {
        res.status(400).json({ message: "Falta el texto del chiste" });
    } else if (!puntaje && puntaje !== 0) {
        res.status(400).json({ message: "Falta el puntaje del chiste" });
    } else if (puntaje < 1 || puntaje > 10) {
        res.status(400).json({ message: "Puntaje debe estar entre 1 y 10" });
    } else if (!categoria) {
        res.status(400).json({ message: "Falta la categoria del chiste" });
    } else if (categoria !== "Dad joke" && categoria !== "Humor Negro" && categoria !== "Chistoso" && categoria !== "Malo") {
        res.status(400).json({ message: "Categoria no válida" });
    } else {
        let author_a_guardar;
        if (author) {
            author_a_guardar = author;
        } else {
            author_a_guardar = "Se perdió en el Ávila como Led"
        }

        const chiste = new ChistePropio({
            texto: texto,
            author: author_a_guardar,
            puntaje: puntaje,
            categoria: categoria,
        });
        await chiste.save();

        res.status(200).json(chistePropioToJoke(chiste));
    }
});

/**
 * @swagger
 * /chistes/Propio/id/{id}:
 *   put:
 *     summary: Actualizar un chiste existente.
 *     tags: [Chistes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del chiste a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Chiste'
 *     responses:
 *       200:
 *         description: Chiste actualizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chiste'
 *       400:
 *         description: Datos inválidos o ID no encontrado.
 */
router.put("/chistes/Propio/id/:id", async (req, res) => {
    const { id } = req.params;
    const { texto, author, puntaje, categoria } = req.body;

    try {
        // Validate puntaje
        if (puntaje !== undefined && (puntaje < 1 || puntaje > 10)) {
            return res.status(400).json({ message: "Puntaje debe estar entre 1 y 10" });
        }

        // Validate categoria
        if (categoria && !["Dad joke", "Humor Negro", "Chistoso", "Malo"].includes(categoria)) {
            return res.status(400).json({ message: "Categoria no válida" });
        }

        // Prevent updates to ID
        if (req.body.id) {
            return res.status(400).json({ message: "No se puede especificar un ID" });
        }

        // Update the joke
        let updatedJoke;
        if (mongoose.Types.ObjectId.isValid(id)) {
            updatedJoke = await ChistePropio.findByIdAndUpdate(
                id,
                { texto, author, puntaje, categoria },
                { new: true, runValidators: true }
            );
        }

        if (!updatedJoke) {
            return res.status(400).json({ message: "No se puede encontrar el chiste" });
        }

        res.status(200).json(chistePropioToJoke(updatedJoke));
    } catch (error) {
        console.error("Error updating joke:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;