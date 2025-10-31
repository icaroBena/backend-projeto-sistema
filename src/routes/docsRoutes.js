const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Configurações do Swagger UI
const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "WorkMatch API Documentation",
  customfavIcon: "/favicon.ico"
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, options));

module.exports = router;