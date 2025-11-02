//importacion de modulo necesarios 
const Sequelize=require("sequelize");
const dotenv = require("dotenv").config();

//importacion de variables de entorno para la database
const databaseName=process.env.DB_NAME;
const password=process.env.DB_PASSWORD;
const user=process.env.DB_USER;
const dialect=process.env.DB_DIALECT;
const host=process.env.HOST;
//const port = Number(process.env.DB_PORT) || 5432;

//conexion con la base de datos
const sequelize= new Sequelize(databaseName,user,password,{
    host: host,
    dialect: dialect,
    loggin: false,
});

sequelize.authenticate().then(()=>{
    console.log("Conexion establecida correctamente");})
.catch((err)=>{
    console.log("Error al conectarse ala base de datos");
});

module.exports = sequelize;