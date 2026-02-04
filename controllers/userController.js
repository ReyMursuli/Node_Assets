const User = require('../models/user');
const Departament = require('../models/departament');
const createUser = async (username, email, password, role, profileImage = null) => {
    const user = await User.create({
        username,
        email,
        password,
        role,
        profileImage
    });
    return user.toJSON();
};

const updateUser = async (id, username, email, role, profileImage, password) => {
    const user = await User.findByPk(id);
    if (!user) return null;

    const updateData = { 
        username: username || user.username, 
        role: role || user.role, 
        email: email || user.email 
    };

    if (typeof profileImage === 'string') {
        updateData.profileImage = profileImage;
    }

    if (password && password.trim() !== "") {
        user.password = password;
    }

    
    await user.set(updateData);
    await user.save(); 

    return user;
};

const updateUserPassword = async (id, newPassword) => {
    const usuario = await User.update({ password: newPassword }, { where: { id } });
    return usuario;
};

const updateUserProfileImage = async (id, profileImage) => {
    const usuario = await User.update({ profileImage }, { where: { id } });
    return usuario;
};

const deleteUser = async (id) => {
    const usuario = await User.destroy({ where: { id } });
    return usuario;
};

const getUser = async () => {
    const users = await User.findAll({
        attributes: { exclude: ['password', 'twoFactorSecret'] }
    });
    return users;
};

const getUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'twoFactorSecret'] }
    });
    return user;
};
const countUsers = async () => {
    const count = await User.count();
    return count;
}

const getUserProfile = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'twoFactorSecret'] }, 
        include: [{
            model: Departament,
            as: 'departamentoResponsable' 
        }]
    });
    return user;
};

module.exports = {
    createUser,
    updateUser,
    updateUserPassword,
    updateUserProfileImage,
    deleteUser,
    getUser,
    getUserById,
    countUsers,
    getUserProfile
};