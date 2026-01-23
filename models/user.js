const {DataTypes}=require("sequelize");
const sequelize=require("../helpers/database");

const User = sequelize.define('User',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true,
    },

    username:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
    },

    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate:{
            isEmail:true
        }
    },

    role:{
        type:DataTypes.ENUM('admin','responsable'),
        defaultValue:'admin',
    },

    // NUEVO CAMPO AGREGADO
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
},{
    sequelize,
    tableName:'users',
    modelName: 'Users',
    timestamps:true,
});

module.exports=User;