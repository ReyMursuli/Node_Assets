const {DataTypes}=require("sequelize");
const sequelize=require("../helpers/database");
const Departament=require("./departament");

const Asset =sequelize.define('Asset',{
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
    },

    rotulo:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    val_inicial:{
        type:DataTypes.DECIMAL(15,2),
        allowNull:false,
        defaultValue:0.00,
        validate:{
            min:0,
        },
    },
    val_residual:{
        type:DataTypes.DECIMAL(15,2),
        allowNull:false,
        defaultValue:0.00,
        validate:{
            min:0,
        },
    },
    dep_acomulada:{
        type:DataTypes.DECIMAL(15,2),
        defaultValue:0,
        validate:{
            min:0,
        },   
    },
    /*departamentId:{
        type:DataTypes.INTEGER,
        allowNull:true,
        references:{
            model:'departments',
            key:'id'
        }
    },*/
},{
    sequelize,
    modelName: "Asset",
    tableName: "assets",
    timestamps: true,
    paranoid: true,
});

Departament.hasMany(Asset,{
    foreignKey:"departamentId",
    onDelete:'CASCADE',
    onUpdate:'CASCADE',
});

Asset.belongsTo(Departament,{
    foreignKey:"departamentId",
    onDelete:'CASCADE',
    onUpdate:'CASCADE',
});



module.exports=Asset;

