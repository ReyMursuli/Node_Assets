const User = require("../models/user");
const Departament = require("../models/departament");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const AppError = require("../errors/AppError");

/**
 * Genera tokens de acceso y refresco
 */
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role ,username: user.username},
        process.env.JWT_SECRET,
        { expiresIn: '1h' } 
    );

    const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

/**
 * Lógica principal de Login
 */
const loginUser = async (email, password, twoFactorCode) => {
    console.log(`\n[Auth] Intento de login para: ${email}`);

    // Buscamos al usuario
    const user = await User.findOne({
        where: { email },
        include: [{
            model: Departament,
            as: 'departamentoResponsable',
            attributes: ['id', 'nombre', 'codigo']
        }]
    });

    if (!user) {
        console.error(`[Auth Error] Usuario no encontrado: ${email}`);
        throw new AppError("Credenciales inválidas", 401);
    }

    // Validamos contraseña
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
        console.error(`[Auth Error] Contraseña incorrecta para: ${email}`);
        throw new AppError("Credenciales inválidas", 401);
    }

    // --- BLOQUE 2FA MODIFICADO PARA FUNCIONAR CON TU FRONTEND ---
    if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
            console.log(`[Auth] 2FA requerido para: ${email}`);
            // Cambiamos el return por un throw para que Nuxt Auth lo capture como error
            throw new AppError("2FA_REQUIRED", 401); 
        }
        
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorCode,
            window: 2
        });

        if (!verified) {
            console.error(`[Auth Error] Código 2FA inválido para: ${email}`);
            throw new AppError("Código 2FA inválido", 401);
        }
    }

    // Generación de tokens (Mantenemos todo tu código original abajo)
    const tokens = generateTokens(user);
    
    // Actualizamos timestamp de actividad
    user.changed('updatedAt', true);
    await user.save();

    console.log(`[Auth Success] Login exitoso: ${email} (ID: ${user.id})`);

    return {
        user: user.toJSON(),
        ...tokens,
        expiresIn: 3600 
    };
};

/**
 * Obtener datos de la sesión actual
 */
const getUserSession = async (id) => {
    console.log(`[Auth] Buscando sesión para ID: ${id}`);
    const user = await User.findByPk(id, {
        include: [{
            model: Departament,
            as: 'departamentoResponsable',
            attributes: ['id', 'nombre', 'codigo']
        }]
    });
    
    if (!user) {
        console.error(`[Auth Error] Sesión no encontrada para ID: ${id}`);
        throw new AppError("Usuario no encontrado", 404);
    }
    
    return user.toJSON();
};

/**
 * Refrescar tokens usando el Refresh Token
 */
const refreshTokens = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        
        if (decoded.type !== 'refresh') {
            throw new AppError("Tipo de token inválido", 401);
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            throw new AppError("Usuario no encontrado", 401);
        }

        console.log(`[Auth] Tokens refrescados para el usuario ID: ${user.id}`);
        return { ...generateTokens(user), expiresIn: 3600 };
    } catch (error) {
        console.error(`[Auth Error] Fallo al refrescar token: ${error.message}`);
        throw new AppError("Sesión expirada o token inválido", 401);
    }
};

/**
 * Configuración inicial del 2FA
 */
const setup2FA = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("Usuario no encontrado", 404);

    const secret = speakeasy.generateSecret({
        name: `Assets API (${user.email})`,
        issuer: 'Assets Management System',
        length: 32
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    console.log(`[Auth] 2FA configurado para: ${user.email}`);
    
    return { secret: secret.base32, qrCode: qrCodeUrl };
};

const logoutUser = async (userId) => {
    // Aquí puedes añadir lógica de logs si quieres
    console.log(`[Auth] Sesión terminada para el usuario: ${userId}`);
    return { success: true };
};
const verifyAndEnable2FA = async (userId, token) => {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("Usuario no encontrado", 404);

    // Validamos el código usando el secreto que ya guardamos en setup2FA
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 1 
    });

    if (!verified) {
        throw new AppError("Código de verificación inválido", 400);
    }

    // AHORA SÍ: Activamos el 2FA definitivamente
    user.twoFactorEnabled = true;
    await user.save();

    console.log(`[Auth] 2FA activado permanentemente para: ${user.email}`);
    return { success: true, message: "2FA activado correctamente" };
};

module.exports = {
    loginUser,
    getUserSession,
    refreshTokens,
    setup2FA,
    logoutUser,
    verifyAndEnable2FA
};