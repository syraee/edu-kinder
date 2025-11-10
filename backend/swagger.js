const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'EDUkinder API',
        description: 'Automaticky generovaná Swagger dokumentácia pre EDUkinder',
    },
    host: 'localhost:5000',
    schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/routes/routes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
