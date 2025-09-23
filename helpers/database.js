//importacion de modulo necesarios 
const Sequelize=require("sequelize");
const dotenv = require("dotenv").config();

//importacion de variables de entorno para la database
const databaseName=process.env.DB_NAME;
const password=process.env.DB_PASSWORD;
const user=process.env.DB_USER;
const dialect=process.env.BD_DIALECT;
const host=process.env.HOST;

//conexion con la base de datos
const sequelize=new Sequelize(databaseName,user,password,{
    host:host,
    dialect:dialect,
    loggin:false,
});

sequelize.authenticate().then(()=>{
    console.log("conexion establecida correctamente");})
.catch((err)=>{
    console.log("Error al conectarse ala base de datos");
})

module.exxports =sequelize;