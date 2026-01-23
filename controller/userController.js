const User = require('../models/user');

const createUser = async (username, email, role, profileImage = null) => {
    const user = await User.create({
        username,
        email,
        role,
        profileImage
    });
    return user;
};

const updateUser = async (id, username, email, role, profileImage) => {
    const updateData = { username, role, email };
    if (typeof profileImage === 'string') {
        updateData.profileImage = profileImage;
    }
    const usuario = await User.update(updateData, { where: { id } });
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
    const users = await User.findAll();
    return users;
};

const getUserById = async (id) => {
    const user = await User.findByPk(id);
    return user;
};

module.exports = {
    createUser,
    updateUser,
    updateUserProfileImage,
    deleteUser,
    getUser,
    getUserById
};