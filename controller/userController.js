const { where } = require('sequelize');
const User = require('../models/user');


const createUser=async(username,email,role)=>{
    const user=await User.create({
        username,
        email,
        role,

    })
    return user;
};


const updateUser=async(id,username,email,role)=>{
    let updateData={username,role,email};
    const usuario=await User.update(updateData,{where:{id}});
    return usuario;
}

const deleteUser=async(id)=>{
    const usuario=await User.destroy({where:{id}});
    return usuario;
}

const getUser=async()=>{
    const users=await Users.findAll();
    return users;
}