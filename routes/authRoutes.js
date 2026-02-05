const router = require("express").Router();
const AppError = require("../errors/AppError");
const authenticate = require("../middlewares/authenticateJswt");
const { 
    loginUser, 
    getUserSession, 
    refreshTokens, 
    setup2FA,
    logoutUser ,
    verifyAndEnable2FA
} = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para manejo de autenticación, sesiones y 2FA
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Autenticación]
 *     description: Autentica a un usuario con email y contraseña. Puede requerir código 2FA.
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
 *                 example: "Password123!"
 *               twoFactorCode:
 *                 type: string
 *                 description: Código de autenticación de dos factores (requerido si 2FA está activado)
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso o requiere 2FA
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         user:
 *                           type: object
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     requiresTwoFactor:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Se requiere código 2FA
 *       400:
 *         description: Datos inválidos o faltantes
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error del servidor
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
 * /auth/session:
 *   get:
 *     summary: Obtener información de sesión del usuario actual
 *     tags: [Autenticación]
 *     description: Retorna los datos del usuario autenticado. Requiere token JWT válido.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de sesión obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "juan_perez"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "juan@ejemplo.com"
 *                 role:
 *                   type: string
 *                   example: "admin"
 *                 departamento:
 *                   type: string
 *                   example: "Ventas"
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get("/session", authenticate(), async (req, res, next) => {
    try {
        const user = await getUserSession(req.user.id);
        res.status(200).json({
            id: user.id,
            username: user.username, 
            email: user.email,
            role: user.role,
            departamento: user.departamentoResponsable
        });
    } catch (error) {
        next(error);
    }
});

router.post("/2fa/verify", authenticate(), async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) throw new AppError("Código requerido", 400);

        const result = await verifyAndEnable2FA(req.user.id, token);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refrescar tokens de acceso
 *     tags: [Autenticación]
 *     description: Genera nuevos tokens de acceso usando un refresh token válido
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
 *                 description: Refresh token válido
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens refrescados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Refresh token no proporcionado
 *       401:
 *         description: Refresh token expirado o inválido
 *       500:
 *         description: Error del servidor
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
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     tags: [Autenticación]
 *     description: Invalida la sesión del usuario actual. Requiere token JWT válido.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout exitoso"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post("/logout", authenticate(), async (req, res, next) => {
    try {
        await logoutUser(req.user.id);
        res.status(200).json({ success: true, message: "Logout exitoso" });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /auth/2fa/setup:
 *   post:
 *     summary: Configurar autenticación de dos factores
 *     tags: [Autenticación]
 *     description: Genera secret y QR code para configurar 2FA. Requiere token JWT válido.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración 2FA generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     secret:
 *                       type: string
 *                       description: Secret para 2FA
 *                     qrCodeUrl:
 *                       type: string
 *                       description: URL del código QR para escanear
 *                     manualEntryKey:
 *                       type: string
 *                       description: Clave para entrada manual en app de autenticación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
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

