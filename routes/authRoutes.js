const express = require('express');
const router = express.Router();
const AuthController = require('../controller/authController');
const authenticate = require('../middlewares/authenticateJswt');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Contraseña del usuario
 *         twoFactorCode:
 *           type: string
 *           description: Código 2FA (si está habilitado)
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *             expiresIn:
 *               type: number
 *             requiresTwoFactor:
 *               type: boolean
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *       401:
 *         description: Token inválido o expirado
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       401:
 *         description: No autenticado
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Configurar autenticación de dos factores
 *     tags: [Authentication, 2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración 2FA generada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *                     qrCode:
 *                       type: string
 *                     manualEntryKey:
 *                       type: string
 *       401:
 *         description: No autenticado
 */
router.post('/2fa/setup', authenticate, AuthController.setupTwoFactor);

/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     summary: Verificar y habilitar 2FA
 *     tags: [Authentication, 2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Código de 6 dígitos de Google Authenticator
 *     responses:
 *       200:
 *         description: 2FA habilitado exitosamente
 *       400:
 *         description: Código inválido
 *       401:
 *         description: No autenticado
 */
router.post('/2fa/verify', authenticate, AuthController.verifyAndEnableTwoFactor);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Desactivar autenticación de dos factores
 *     tags: [Authentication, 2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario para confirmar
 *     responses:
 *       200:
 *         description: 2FA desactivado exitosamente
 *       401:
 *         description: Contraseña inválida o no autenticado
 */
router.post('/2fa/disable', authenticate, AuthController.disableTwoFactor);

module.exports = router;
