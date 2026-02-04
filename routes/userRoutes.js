const router = require("express").Router();
const AppError = require("../errors/AppError");
const authenticate = require("../middlewares/authenticateJswt");
const upload = require("../middlewares/multerConfig");

const {
    createUser,
    deleteUser,
    getUser,
    updateUser,
    updateUserProfileImage,
    getUserById,
    countUsers,
    getUserProfile
} = require("../controllers/userController");

/**
 * @swagger
 * /api/users/count:
 *   get:
 *     summary: Obtiene el número total de usuarios registrados
 *     tags:
 *       - Usuario
 *     responses:
 *       200:
 *         description: Conteo total de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 150
 *       500:
 *         description: Error de servidor
 */
router.get(
    "/count",
    authenticate(['admin']),
    async (req, res, next) => {
        try {
            const total = await countUsers();
            res.status(200).json({ total });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/profile",
    authenticate(['admin', 'responsable']), // Middleware que ya tienes
    async (req, res, next) => {
        try {
            // El ID viene del token decodificado por el middleware 'authenticate'
            const userId = req.user.id; 
            
            const user = await getUserProfile(userId);

            if (!user) {
                throw new AppError("Usuario no encontrado", 404);
            }

            res.status(200).json({
                success: true,
                user: user
            });
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    "/profile/update",
    authenticate(['admin', 'responsable']),
    async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
            // El ID viene del token JWT decodificado
            const userId = req.user.id; 

            const updatedUser = await updateUser(userId, username, email, null, null, password);

            res.status(200).json({
                success: true,
                message: "Perfil actualizado correctamente",
                user: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtiene una lista de usuarios
 *     tags:
 *       - Usuario
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error de servidor
 */
router.get(
    "/",
    authenticate(['admin']),
    async (req, res, next) => {
        try {
            const usuarios = await getUser();
            res.status(200).json(usuarios);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags:
 *       - Usuario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Todos los campos son requeridos
 *       500:
 *         description: Error de servidor
 */
router.post(
    "/create",
    authenticate(['admin']),
    upload.single('profileImage'),
    async (req, res, next) => {
        try {
            const { username, email, password, role } = req.body;
            let profileImage = null;

            if (!username || !email || !password) {
                throw new AppError("Username, email y contraseña son requeridos", 400);
            }

            if (password.length < 6) {
                throw new AppError("La contraseña debe tener al menos 6 caracteres", 400);
            }

            if (req.file) {
                profileImage = `images/profiles/${req.file.filename}`;
            }

            const user = await createUser(username, email, password, role, profileImage);

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario específico por ID
 *     tags:
 *       - Usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error de servidor
 */
router.get(
    "/:id",
    authenticate(['admin', 'responsable']),
    async (req, res, next) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError("El id es requerido", 400);
            }

            if (req.userRole === 'responsable' && parseInt(id) !== req.user.id) {
                throw new AppError("Solo puedes ver tu propio perfil", 403);
            }

            const user = await getUserById(id);

            if (!user) {
                throw new AppError("Usuario no encontrado", 404);
            }

            res.status(200).json({
                success: true,
                user: user
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /api/users/update/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     tags:
 *       - Usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: El id es requerido o todos los campos son requeridos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error de servidor
 */
router.put(
    "/update/:id",
    authenticate(['admin']),
    upload.single('profileImage'),
    async (req, res, next) => {
        try {
            const { username, role, email } = req.body;
            const { id } = req.params;
            let profileImage = null;

            if (!id) {
                throw new AppError("El id es requerido", 400);
            }

            if (!username || !role || !email) {
                throw new AppError("Todos los campos son requeridos", 400);
            }

            if (req.file) {
                profileImage = `images/profiles/${req.file.filename}`;
            }

            const user = await updateUser(id, username, email, role, profileImage);
            if (user == 0) {
                throw new AppError("Usuario no encontrado", 404);
            }

            res.status(200).json({
                mensaje: "Usuario actualizado",
                profileImage: profileImage
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /api/users/upload-profile-image/{id}:
 *   put:
 *     summary: Actualiza solo la imagen de perfil de un usuario
 *     tags:
 *       - Usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen de perfil actualizada
 *       400:
 *         description: El id es requerido o no se proporcionó imagen
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error de servidor
 */
router.put(
    "/upload-profile-image/:id",
    authenticate(['admin']),
    upload.single('profileImage'),
    async (req, res, next) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError("El id es requerido", 400);
            }

            if (!req.file) {
                throw new AppError("No se proporcionó ninguna imagen", 400);
            }

            const filePath = `images/profiles/${req.file.filename}`;
            const user = await updateUserProfileImage(id, filePath);

            if (user == 0) {
                throw new AppError("Usuario no encontrado", 404);
            }

            res.status(200).json({
                success: true,
                message: "Imagen de perfil actualizada correctamente",
                filePath: filePath,
                user: {
                    id: id,
                    profileImage: filePath
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /api/users/delete/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     tags:
 *       - Usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error de servidor
 */
router.delete(
    "/delete/:id",
    authenticate(['admin']),
    async (req, res, next) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError("El id es requerido", 400);
            }

            const user = await deleteUser(id);
            if (user == 0) {
                throw new AppError("Usuario no encontrado", 404);
            }
            res.status(200).json({ mensaje: "Usuario eliminado" })

        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;