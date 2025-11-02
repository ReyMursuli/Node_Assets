const {DataTypes}=require("sequelize");
const sequelize=require("../helpers/database");
const User=require("./user");

const Departament=sequelize.define('Departament',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    nombre:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    codigo:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
    },
    
    /*responsableId: {  
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',  // nombre de la tabla users
            key: 'id'
        }
    },*/
},{
    sequelize,
    tableName:'departments',
    modelName: 'Departments',
    timestamps:true,
}
);


User.hasOne(Departament,{
    foreignKey:"reponsableId",
    as:('departamentoResponsable'),
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
}),

Departament.belongsTo(User,{
    foreignKey:"responsableId",
    onDelete:"CASCADE",
    onUpdate:"CASCADE",
});

module.exports=Departament;