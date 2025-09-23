const User = require('../models/user');


const createUser=async(req,res)=>{

    const {username,email,role}=req.body;
    const newUser = await User.create({
            username,
            email,
            role: role || 'admin' // Valor por defecto si no se especifica
    })
}