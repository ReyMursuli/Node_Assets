const User = require('../models/user');

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

const updateUser = async (id, username, email, role, profileImage) => {
    const updateData = { username, role, email };
    if (typeof profileImage === 'string') {
        updateData.profileImage = profileImage;
    }
    const usuario = await User.update(updateData, { where: { id } });
    return usuario;
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

module.exports = {
    createUser,
    updateUser,
    updateUserPassword,
    updateUserProfileImage,
    deleteUser,
    getUser,
    getUserById,
    countUsers
};