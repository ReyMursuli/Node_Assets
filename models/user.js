const {DataTypes}=require("sequelize");
const sequelize=require("../helpers/database");
const bcrypt=require("bcrypt");

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

    password:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            len:[6,100]
        }
    },

    role:{
        type:DataTypes.ENUM('admin','responsable'),
        defaultValue:'admin',
    },

    // Campos para 2FA
    twoFactorSecret:{
        type:DataTypes.STRING,
        allowNull:true,
    },

    twoFactorEnabled:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
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
    
    // Hooks para encriptar contraseña automáticamente
    hooks:{
        beforeSave:async(user)=>{
            if(user.changed('password')){
                const saltRounds=12;
                user.password=await bcrypt.hash(user.password,saltRounds);
            }
        }
    }
});

// Método para validar contraseña
User.prototype.validatePassword=async function(password){
    return await bcrypt.compare(password,this.password);
};

// Sobrescribir toJSON para excluir campos sensibles
User.prototype.toJSON=function(){
    const values=Object.assign({},this.get());
    delete values.password;
    delete values.twoFactorSecret;
    return values;
};

module.exports=User;