require('dotenv').config();

// Imports de bibliotecas
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Imports de helpers y middlewares
const sequelize = require("./helpers/database.js");
const errorHandler = require("./middlewares/errorHandler.js");

// Imports de modelos
const User = require("./models/user.js");
const Departament = require("./models/departament.js");
const Asset = require("./models/asset.js");

// Imports de rutas
const userRoutes = require('./routes/userRoutes');
const routesAsset = require("./routes/assetRoutes.js");
const routesDepartent = require("./routes/departamentRoutes.js");
const authRoutes = require('./routes/authRoutes');

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { 
            title: 'API Assets',
            version: '1.0.0',
            description: 'API Assets',    
        },
    },
    apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Inicialización de Express
const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(
    cors({
        origin: function (origin, callback) {
            
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"] 
    })
);

// Middlewares básicos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', routesAsset);
app.use('/api/departments', routesDepartent);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta raíz
app.get('/', (req, res) => {
    res.send("Hola Mundo!")
});

// Middleware de manejo de errores 
app.use(errorHandler);


// Sincronización de base de datos
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("Todos los modelos se sincronizaron correctamente.");
    }) 
    .catch((err) => {
        console.log("Ha ocurrido un error al sincronizar los modelos: ", err); 
    });

// Inicio del servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});