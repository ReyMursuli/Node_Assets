const { where } = require('sequelize');
const User = require('../models/user');
const { get } = require('../routes/userRoutes');
const upload=require('../middlewares/multerConfig');
const { profile } = require('winston');

const createUser=async(username,email,role)=>{
    const user=await User.create({
        username,
        email,
        role,

    })
    return user;
};


const updateUser=async(id,username,email,role,profileImage)=>{
    let updateData={username,role,email,profileImage};
    const usuario=await User.update(updateData,{where:{id}});
    return usuario;
}

const deleteUser=async(id)=>{
    const usuario=await User.destroy({where:{id}});
    return usuario;
}

const getUser=async()=>{
    const users=await User.findAll();
    return users;
}


module.exports={
    createUser,updateUser,deleteUser,getUser
};