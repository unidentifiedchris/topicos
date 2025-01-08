const mongoose = require("mongoose");

const DB_USER = process.env.MONGO_USERNAME,
    DB_PASS = process.env.MONGO_PASSWORD,
    DB_HOST = process.env.MONGO_HOSTNAME,
    DB_PORT = process.env.MONGO_PORT,
    DB_NAME = process.env.MONGO_DB;

mongoose.set("strictQuery", false);
// mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}_test?authSource=admin`);

async function connectToDatabase() {
    try {
        await mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}_test?authSource=admin`);
    } catch (error) {
        console.log("Error connecting to database", error);
        throw error;
    }
}
async function dropDatabase(params) {
    try {
        await mongoose.connection.dropDatabase();
    } catch (error) {
        console.log("Error dropping database", error);
        throw error;
    }
}
async function disconnectFromDatabase(params) {
    try {
        await mongoose.connection.close();
    } catch (error) {
        console.log("Error disconnecting from database", error);
        throw error;
    }
}

const app = require("./app");
const supertest = require("supertest");
const request = supertest(app);

describe("GET /chistes/:tipo", () => {
    beforeAll(async () => {
        await connectToDatabase();
        await dropDatabase();
    });
    afterAll(async () => {
        await dropDatabase();
        await disconnectFromDatabase();
    });

    it("debe retornar 200 OK para Chuck", async () => {
        const response = await request.get("/chistes/Chuck");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("texto");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("api.chucknorris.io");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body).toHaveProperty("categoria");
    });
    it("debe retornar 200 OK para Dad", async () => {
        const response = await request.get("/chistes/Dad");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("texto");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("icanhazdadjoke.com");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body).toHaveProperty("categoria");
        expect(response.body.categoria).toEqual("Dad joke");
    });
    it("debe retornar 422 para Propio", async () => {
        const response = await request.get("/chistes/Propio");
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Aun no hay chistes, cree uno!");
    });
    it("debe retornar 400 for :tipo invalido", async () => {
        const response = await request.get("/chistes/TipoInvalido");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Tipo de chiste no válido");
    });
});

describe("POST /chistes/Propio", () => {
    beforeAll(async () => {
        await connectToDatabase();
        await dropDatabase();
    });
    afterAll(async () => {
        await dropDatabase();
        await disconnectFromDatabase();
    });

    it("debe retornar 200 OK para chiste valido", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
            "author": "Israel",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;
        expect(response.body).toHaveProperty("texto");
        expect(response.body.texto).toEqual("¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("Israel");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body.puntaje).toEqual(1);
        expect(response.body).toHaveProperty("categoria");
        expect(response.body.categoria).toEqual("Malo");

        response = await request.get("/chistes/Propio");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);
        expect(response.body).toHaveProperty("texto");
        expect(response.body.texto).toEqual("¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("Israel");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body.puntaje).toEqual(1);
        expect(response.body).toHaveProperty("categoria");
        expect(response.body.categoria).toEqual("Malo");

        response = await request.post("/chistes/Propio").send({
            "texto": "Mentí. No hay chiste.",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("texto");
        expect(response.body.texto).toEqual("Mentí. No hay chiste.");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("Se perdió en el Ávila como Led");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body.puntaje).toEqual(1);
        expect(response.body).toHaveProperty("categoria");
        expect(response.body.categoria).toEqual("Malo");
    });
    it("debe retornar 400 para falta de texto", async () => {
        let response = await request.post("/chistes/Propio").send({
            "author": "Israel",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Falta el texto del chiste");
    });
    it("debe retornar 400 para falta de puntaje", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
            "author": "Israel",
            "categoria": "Malo"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Falta el puntaje del chiste");
    });
    it("debe retornar 400 para puntaje menor a 1", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
            "author": "Israel",
            "puntaje": 0,
            "categoria": "Malo"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Puntaje debe estar entre 1 y 10");
    });
    it("debe retornar 400 para puntaje mayor a 10", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
            "author": "Israel",
            "puntaje": 11,
            "categoria": "Malo"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Puntaje debe estar entre 1 y 10");
    });
    it("debe retornar 400 para falta de categoria", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
            "author": "Israel",
            "puntaje": 1
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Falta la categoria del chiste");
    });
    it("debe retornar 400 para categoria invalida", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
            "author": "Israel",
            "puntaje": 1,
            "categoria": "Maaaaloo"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Categoria no válida");
    });
    it("debe retornar 400 para id especificado", async () => {
        let response = await request.post("/chistes/Propio").send({
            "id": "1234567890",
            "texto": "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
            "author": "Israel",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("No se puede especificar un ID");
    });
});

describe("PUT /chistes/Propio/id/:id", () => {
    beforeAll(async () => {
        await connectToDatabase();
        await dropDatabase();
    });
    beforeEach(async () => {
        await dropDatabase();
    });
    afterEach(async () => {
        await dropDatabase();
    });
    afterAll(async () => {
        await dropDatabase();
        await disconnectFromDatabase();
    });

    it("debe retornar 200 OK para chiste valido", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "Cargando chiste...",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.put("/chistes/Propio/id/" + id).send({
            "texto": ">Papá, ¿qué es el humor negro?\r\n<¿Ves ese hombre sin brazos? Dile que aplauda.\r\n>Pero papá soy ciego\r\n<Exacto",
            "author": "yavendras.com",
            "puntaje": 6,
            "categoria": "Humor Negro"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);
        expect(response.body).toHaveProperty("texto");
        expect(response.body.texto).toEqual(">Papá, ¿qué es el humor negro?\r\n<¿Ves ese hombre sin brazos? Dile que aplauda.\r\n>Pero papá soy ciego\r\n<Exacto");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("yavendras.com");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body.puntaje).toEqual(6);
        expect(response.body).toHaveProperty("categoria");
        expect(response.body.categoria).toEqual("Humor Negro");

        response = await request.get("/chistes/Propio");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);
        expect(response.body).toHaveProperty("texto");
        expect(response.body.texto).toEqual(">Papá, ¿qué es el humor negro?\r\n<¿Ves ese hombre sin brazos? Dile que aplauda.\r\n>Pero papá soy ciego\r\n<Exacto");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("yavendras.com");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body.puntaje).toEqual(6);
        expect(response.body).toHaveProperty("categoria");
        expect(response.body.categoria).toEqual("Humor Negro");
    });
    it("debe retornar 400 para puntaje menor a 1", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "No tengo chiste",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.put("/chistes/Propio/id/" + id).send({
            "puntaje": 0,
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Puntaje debe estar entre 1 y 10");
    });
    it("debe retornar 400 para puntaje mayor a 10", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "No tengo chiste",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.put("/chistes/Propio/id/" + id).send({
            "puntaje": 11,
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Puntaje debe estar entre 1 y 10");
    });
    it("debe retornar 400 para categoria invalida", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "No tengo chiste",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.put("/chistes/Propio/id/" + id).send({
            "categoria": "Neegro"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Categoria no válida");
    });
    it("debe retornar 400 para id especificado", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "No tengo chiste",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.put("/chistes/Propio/id/" + id).send({
            "id": `0xff${id}`
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("No se puede especificar un ID");
    });
    it("debe retornar 400 para id invalido", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "No tengo chiste",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.put("/chistes/Propio/id/0xff" + id).send({
            "texto": "Sigo sin tener chiste :c",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("No se puede encontrar el chiste");
    });
});

describe("DELETE /chistes/Propio/id/:id", () => {
    beforeAll(async () => {
        await connectToDatabase();
        await dropDatabase();
    });
    beforeEach(async () => {
        await dropDatabase();
    });
    afterEach(async () => {
        await dropDatabase();
    });
    afterAll(async () => {
        await dropDatabase();
        await disconnectFromDatabase();
    });

    it("debe retornar 200 OK para chiste valido", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "Este chiste se borrará :<",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.get("/chistes/Propio");
        expect(response.status).toBe(200);

        response = await request.delete("/chistes/Propio/id/" + id);
        expect(response.status).toBe(200);

        response = await request.get("/chistes/Propio");
        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Aun no hay chistes, cree uno!");
    });
    it("debe retornar 400 para id invalido", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "Este chiste permanecerá :>",
            "puntaje": 2,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.get("/chistes/Propio");
        expect(response.status).toBe(200);

        response = await request.delete("/chistes/Propio/id/0xff" + id);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("No se puede encontrar el chiste");

        response = await request.get("/chistes/Propio");
        expect(response.status).toBe(200);
    });
});

describe("GET /chistes/Propio/id/:id", () => {
    beforeAll(async () => {
        await connectToDatabase();
        await dropDatabase();
    });
    beforeEach(async () => {
        await dropDatabase();
    });
    afterEach(async () => {
        await dropDatabase();
    });
    afterAll(async () => {
        await dropDatabase();
        await disconnectFromDatabase();
    });

    it("debe retornar 200 OK para chiste valido", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "<este repositorio de código>",
            "author": "Grupo de Proyecto",
            "puntaje": 10,
            "categoria": "Chistoso"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        await request.post("/chistes/Propio").send({
            "texto": "<estos tests>",
            "author": "Grupo de Proyecto",
            "puntaje": 6,
            "categoria": "Malo"
        });
        await request.post("/chistes/Propio").send({
            "texto": "<estos tests>",
            "author": "Grupo de Proyecto",
            "puntaje": 6,
            "categoria": "Malo"
        });
        await request.post("/chistes/Propio").send({
            "texto": "<estos tests>",
            "author": "Grupo de Proyecto",
            "puntaje": 6,
            "categoria": "Malo"
        });
        await request.post("/chistes/Propio").send({
            "texto": "<estos tests>",
            "author": "Grupo de Proyecto",
            "puntaje": 6,
            "categoria": "Malo"
        });
        await request.post("/chistes/Propio").send({
            "texto": "<estos tests>",
            "author": "Grupo de Proyecto",
            "puntaje": 6,
            "categoria": "Malo"
        });
        await request.post("/chistes/Propio").send({
            "texto": "<estos tests>",
            "author": "Grupo de Proyecto",
            "puntaje": 6,
            "categoria": "Malo"
        });

        response = await request.get("/chistes/Propio/id/" + id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);
        expect(response.body).toHaveProperty("texto");
        expect(response.body.texto).toEqual("<este repositorio de código>");
        expect(response.body).toHaveProperty("author");
        expect(response.body.author).toEqual("Grupo de Proyecto");
        expect(response.body).toHaveProperty("puntaje");
        expect(response.body.puntaje).toEqual(10);
        expect(response.body).toHaveProperty("categoria");
        expect(response.body.categoria).toEqual("Chistoso");

        response = await request.get("/chistes/Propio/id/" + id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);

        response = await request.get("/chistes/Propio/id/" + id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);

        response = await request.get("/chistes/Propio/id/" + id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);

        response = await request.get("/chistes/Propio/id/" + id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);

        response = await request.get("/chistes/Propio/id/" + id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.id).toEqual(id);
    });
    it("debe retornar 400 para id invalido", async () => {
        let response = await request.post("/chistes/Propio").send({
            "texto": "Este chiste nunca será leido :'(",
            "puntaje": 1,
            "categoria": "Malo"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        id = response.body.id;

        response = await request.get("/chistes/Propio");
        expect(response.status).toBe(200);

        response = await request.get("/chistes/Propio/id/0xff" + id);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("No se puede encontrar el chiste");
    });
});

describe("GET /chistes/Propio/op/count/ca/:categoria", () => {
    beforeAll(async () => {
        await connectToDatabase();
        await dropDatabase();
        
        for (let n = 0; n < 5; n++) {
            response = await request.post("/chistes/Propio").send({
                "texto": `<chistoso #${n}>`,
                "author": "Grupo de Proyecto",
                "puntaje": 7,
                "categoria": "Chistoso"
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
        }
        
        for (let n = 0; n < 10; n++) {
            response = await request.post("/chistes/Propio").send({
                "texto": `<hn #${n}>`,
                "author": "Grupo de Proyecto",
                "puntaje": 6,
                "categoria": "Humor Negro"
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
        }
        
        for (let n = 0; n < 50; n++) {
            response = await request.post("/chistes/Propio").send({
                "texto": `<malo #${n}>`,
                "author": "Grupo de Proyecto",
                "puntaje": 2,
                "categoria": "Malo"
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
        }
    });
    afterAll(async () => {
        await dropDatabase();
        await disconnectFromDatabase();
    });

    it("debe retornar 200 OK count=5 para Chistosos", async () => {
        let response = await request.get("/chistes/Propio/op/count/ca/Chistoso");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result");
        expect(response.body.result).toEqual(5);
    });
    it("debe retornar 200 OK count=10 para HN", async () => {
        let response = await request.get("/chistes/Propio/op/count/ca/Humor Negro");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result");
        expect(response.body.result).toEqual(10);
    });
    it("debe retornar 200 OK count=50 para Malo", async () => {
        let response = await request.get("/chistes/Propio/op/count/ca/Malo");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("result");
        expect(response.body.result).toEqual(50);
    });
    it("debe retornar 400 para categoria invalida", async () => {
        let response = await request.get("/chistes/Propio/op/count/ca/invalido");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Categoria no válida");
    });
    it("debe retornar 400 para Dj (no hay chistes de tipo Dad joke)", async () => {
        let response = await request.get("/chistes/Propio/op/count/ca/Dad%20joke");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("No hay chistes con la categoria especificada");
    });
});

describe("GET /chistes/Propio/op/all/pu/:puntaje", () => {
    beforeAll(async () => {
        await connectToDatabase();
        await dropDatabase();
        
        for (let i = 1; i <= 10; i++) {
            let categoria;
            if (i <= 2) {
                categoria = "Malo";
            } else if (i <= 4) {
                categoria = "Dad joke";
            } else if (i <= 7) {
                categoria = "Humor Negro";
            } else {
                categoria = "Chistoso";
            }

            for (let j = 1; j <= i; j++) {
                if (j == 8) continue;
                let response = await request.post("/chistes/Propio").send({
                    "texto": `<chiste con puntaje ${j}>`,
                    "author": "Grupo de Proyecto",
                    "puntaje": j,
                    "categoria": categoria
                });
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("id");
            }
        }
    });
    afterAll(async () => {
        await dropDatabase();
        await disconnectFromDatabase();
    });

    it("debe retornar 200 OK para 1-7 y 9-10", async () => {
        for (let i = 1; i <= 10; i++) {
            if (i == 8) continue;
            let response = await request.get(`/chistes/Propio/op/all/pu/${i}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("result");
            expect(response.body.result.every(chiste => chiste.texto == `<chiste con puntaje ${i}>`)).toBe(true);
            expect(response.body.result.every(chiste => chiste.author == "Grupo de Proyecto")).toBe(true);
        }
    });
    it("debe retornar 400 para puntaje < 1", async () => {
        let response = await request.get("/chistes/Propio/op/all/pu/0");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Puntaje debe estar entre 1 y 10");
    });
    it("debe retornar 400 para puntaje > 10", async () => {
        let response = await request.get("/chistes/Propio/op/all/pu/11");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("Puntaje debe estar entre 1 y 10");
    });
    it("debe retornar 400 para puntaje = 8 (no hay chistes con puntaje 8)", async () => {
        let response = await request.get("/chistes/Propio/op/all/pu/8");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toEqual("No hay chistes con el puntaje especificado");
    });
});
