require('dotenv').config();
const express =require('express'); //se importa express
const sequelize=require("./helpers/database.js");
const errorHandler=require("./middlewares/errorHandler.js")
const cors=require('cors');
const userRoutes=require('./routes/userRoutes');
const User=require("./models/user.js");
const Departament=require("./models/departament.js");
const Asset=require("./models/asset.js");



const app=express(); // se crea una app de expres 

app.use(express.urlencoded({extended:true}));

//Cors configuration
const allowedOrigins=["http://localhost:3000", "http://localhost:3001"];
app.use(
    cors({
        origin:allowedOrigins, 
        methods:["GET,HEAD,PUT,PATCH,POST,DELETE"],
        credentials:true,
    })    
);

// Middleware para procesar JSON
app.use(express.json());
app.use(express.static('public'));
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {

    res.send("Hola Mundo!")

})

app.listen(3000, () => {

    console.log("Servidor iniciado en el puerto 3000")
    
})


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
app.use(errorHandler);

//Rutas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const routesUser = require("./routes/userRoutes.js");
const routesAsset = require("./routes/assetRoutes.js");
const routesDepartent = require("./routes/departamentRoutes.js");


app.use(routesUser);
app.use(routesAsset);
app.use(routesDepartent);




// Sincronizar los modelos para verificar la conexión con la base de datos
sequelize
.sync({ alter: true })
.then(() => {
console.log("Todos los modelos se sincronizaron correctamente.");
}) .catch((err) => {
console.log("Ha ocurrido un error al sincronizar los modelos: ", err); 
});