const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChistePropioSchema = new Schema({
    texto: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    puntaje: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    categoria: {
        type: String,
        required: true
    },
});

const ChistePropio = mongoose.model('ChistePropio', ChistePropioSchema);

module.exports = { ChistePropio };