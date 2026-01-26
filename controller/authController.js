const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/user');
const Departament = require('../models/departament');

class AuthController {
    // Generar tokens JWT
    static generateTokens(user) {
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            departmentId: user.departamentoResponsable?.id || null
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7m',
            issuer: 'assets-api',
            audience: 'assets-client'
        });

        const refreshToken = jwt.sign(
            { id: user.id, type: 'refresh' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    // Login de usuario
    static async login(req, res, next) {
        try {
            const { email, password, twoFactorCode } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            // Buscar usuario con su departamento
            const user = await User.findOne({
                where: { email },
                include: [{
                    model: Departament,
                    as: 'departamentoResponsable',
                    attributes: ['id', 'nombre', 'codigo']
                }]
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Validar contraseña
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Si tiene 2FA habilitado, verificar el código
            if (user.twoFactorEnabled) {
                if (!twoFactorCode) {
                    return res.status(200).json({
                        success: true,
                        requiresTwoFactor: true,
                        message: 'Se requiere código de autenticación de dos factores'
                    });
                }

                const verified = speakeasy.totp.verify({
                    secret: user.twoFactorSecret,
                    encoding: 'base32',
                    token: twoFactorCode,
                    window: 2
                });

                if (!verified) {
                    return res.status(401).json({
                        success: false,
                        message: 'Código 2FA inválido'
                    });
                }
            }

            // Generar tokens
            const { accessToken, refreshToken } = AuthController.generateTokens(user);

            // Actualizar último login (opcional)
            user.updatedAt = new Date();
            await user.save();

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: user.toJSON(),
                    accessToken,
                    refreshToken,
                    expiresIn: 420 // 7 minutos en segundos
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Refresh token
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token es requerido'
                });
            }

            // Verificar refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            
            if (decoded.type !== 'refresh') {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
            }

            // Buscar usuario actualizado
            const user = await User.findOne({
                where: { id: decoded.id },
                include: [{
                    model: Departament,
                    as: 'departamentoResponsable',
                    attributes: ['id', 'nombre', 'codigo']
                }]
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Generar nuevos tokens
            const { accessToken, refreshToken: newRefreshToken } = AuthController.generateTokens(user);

            res.json({
                success: true,
                data: {
                    accessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: 420
                }
            });

        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }
            next(error);
        }
    }

    // Logout
    static async logout(req, res, next) {
        try {
            // En una implementación real, podrías invalidar el token en una blacklist
            // Por ahora, simplemente respondemos exitosamente
            res.json({
                success: true,
                message: 'Logout exitoso'
            });
        } catch (error) {
            next(error);
        }
    }

    // Configurar 2FA
    static async setupTwoFactor(req, res, next) {
        try {
            const userId = req.user.id;
            
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Generar secreto
            const secret = speakeasy.generateSecret({
                name: `Assets API (${user.email})`,
                issuer: 'Assets Management System',
                length: 32
            });

            // Guardar secreto temporalmente (no habilitado aún)
            user.twoFactorSecret = secret.base32;
            await user.save();

            // Generar QR code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            res.json({
                success: true,
                data: {
                    secret: secret.base32,
                    qrCode: qrCodeUrl,
                    manualEntryKey: secret.base32
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Verificar y activar 2FA
    static async verifyAndEnableTwoFactor(req, res, next) {
        try {
            const { token } = req.body;
            const userId = req.user.id;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Código de verificación es requerido'
                });
            }

            const user = await User.findByPk(userId);
            if (!user || !user.twoFactorSecret) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario no tiene configuración 2FA pendiente'
                });
            }

            // Verificar token
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token,
                window: 2
            });

            if (!verified) {
                return res.status(400).json({
                    success: false,
                    message: 'Código de verificación inválido'
                });
            }

            // Habilitar 2FA
            user.twoFactorEnabled = true;
            await user.save();

            res.json({
                success: true,
                message: 'Autenticación de dos factores habilitada exitosamente'
            });

        } catch (error) {
            next(error);
        }
    }

    // Desactivar 2FA
    static async disableTwoFactor(req, res, next) {
        try {
            const { password } = req.body;
            const userId = req.user.id;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña es requerida para desactivar 2FA'
                });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña inválida'
                });
            }

            // Desactivar 2FA
            user.twoFactorEnabled = false;
            user.twoFactorSecret = null;
            await user.save();

            res.json({
                success: true,
                message: 'Autenticación de dos factores desactivada'
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
