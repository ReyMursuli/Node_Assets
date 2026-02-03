const router = require("express").Router();
const AppError = require("../errors/AppError");
const authenticate = require("../middlewares/authenticateJswt");
const { 
    loginUser, 
    getUserSession, 
    refreshTokens, 
    setup2FA 
} = require("../controllers/authController");

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
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "contraseña123"
 *               twoFactorCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso o requiere 2FA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 requiresTwoFactor:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", async (req, res, next) => {
    try {
        const { email, password, twoFactorCode } = req.body;
        if (!email || !password) throw new AppError("Email y contraseña requeridos", 400);

        const result = await loginUser(email, password, twoFactorCode);

        if (result.requiresTwoFactor) {
            return res.status(200).json({
                success: false,
                requiresTwoFactor: true,
                message: 'Se requiere código 2FA'
            });
        }

        res.status(200).json({
            success: true,
            data: result 
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Obtener sesión actual
 *     description: Obtiene la información del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión obtenida correctamente
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
 *                     user:
 *                       type: object
 *       401:
 *         description: No autorizado - Token inválido o expirado
 */
router.get("/session", authenticate(), async (req, res, next) => {
    try {
        const user = await getUserSession(req.user.id);
        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar tokens de acceso
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
 *                 description: Token de refresco
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refrescado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Token requerido
 *       401:
 *         description: Token expirado o inválido
 */
router.post("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw new AppError("Token requerido", 400);

        const newTokens = await refreshTokens(refreshToken);
        res.status(200).json({
            success: true,
            data: newTokens
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') return next(new AppError("Sesión expirada", 401));
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Configurar autenticación de dos factores (2FA)
 *     description: Genera un código QR y secreto para configurar 2FA
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración generada correctamente
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
 *                     qrCode:
 *                       type: string
 *                       description: Código QR en formato base64
 *                     secret:
 *                       type: string
 *                       description: Secreto para configurar en la app de autenticación
 *       401:
 *         description: No autorizado
 */
router.post("/2fa/setup", authenticate(), async (req, res, next) => {
    try {
        const result = await setup2FA(req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

