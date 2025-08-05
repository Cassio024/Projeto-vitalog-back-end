const express = require('express');
const router = express.Router();
const AuthenticDrug = require('../models/AuthenticDrug');

// @route   GET api/drugs/verify/:qrCodeId
// @desc    Verifica a autenticidade de um medicamento pelo QR Code
// @access  Public (qualquer pessoa pode verificar)
router.get('/verify/:qrCodeId', async (req, res) => {
    try {
        console.log(`DIAGNÓSTICO: Verificando QR Code ID: ${req.params.qrCodeId}`);

        // Procura no banco de dados pelo ID recebido do QR Code
        const drug = await AuthenticDrug.findOne({ qrCodeId: req.params.qrCodeId });

        // Se não encontrar, retorna que é falso
        if (!drug) {
            console.log('DIAGNÓSTICO: Medicamento NÃO encontrado.');
            return res.status(404).json({
                authentic: false,
                message: 'Produto não encontrado em nosso registro. Risco de falsificação.',
            });
        }

        // Se encontrar, retorna sucesso e os dados do medicamento
        console.log('DIAGNÓSTICO: Medicamento autêntico encontrado!');
        res.json({
            authentic: true,
            message: 'Medicamento Autêntico!',
            data: drug,
        });
    } catch (err) {
        console.error('ERRO NA VERIFICAÇÃO DE MEDICAMENTO:', err.message);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;