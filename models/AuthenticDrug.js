const mongoose = require('mongoose');

const AuthenticDrugSchema = new mongoose.Schema({
    // Código único que estará no QR Code
    qrCodeId: {
        type: String,
        required: true,
        unique: true,
    },
    // Nome do produto para exibição
    productName: {
        type: String,
        required: true,
    },
    // Lote para mais detalhes
    batch: {
        type: String,
        required: true,
    },
    // Data de validade
    expirationDate: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('authentic_drug', AuthenticDrugSchema);