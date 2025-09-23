const express =require('express'); //se importa express
const sequelize=require("./helpers/database.js");

const User=require("./models/user.js");
const Departament=require("./models/departament.js");
const Asset=require("./models/asset.js");

const app=express(); // se crea una app de expres  

// Sincronizar los modelos para verificar la conexión con la base de datos
sequelize
.sync({ alter: true })
.then(() => {
console.log("Todos los modelos se sincronizaron correctamente.");
}) .catch((err) => {
console.log("Ha ocurrido un error al sincronizar los modelos: ", err); 
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configure Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'API Assets',
        version: '1.0.0',
        description: 'API Assets',    
        },
    },
    apis: ['./routes/*.js', ' ./models/*.js'],
};

const swaggerSpec = swaggerJsdoc (swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));