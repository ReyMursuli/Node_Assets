const router = require("express").Router();
const AppError = require("../errors/AppError");
// const authenticate = require("../")
const upload = require("../middlewares/multerConfig"); // Importar Multer

const {
    createUser,
    deleteUser,
    getUser,
    updateUser,
    updateUserProfileImage, // Nuevo controlador para imagen
    getUserById // Nuevo controlador para obtener usuario específico
} = require("../controller/userController");

/**
 * @swagger
 * /usuarios/create:
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
    "/usuarios/create",
    upload.single('profileImage'), // Middleware Multer para subir imagen
    async (req, res, next) => {
        try {
            const { username, email, role } = req.body;
            let profileImage = null;

            if (!username || !email) {
                throw new AppError("Todos los campos son requeridos", 400);
            }

            // Si se subió una imagen, guardar la ruta
            if (req.file) {
                profileImage = `images/profiles/${req.file.filename}`;
            }

            const user = await createUser(username, email, role, profileImage);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /usuarios/update/{id}:
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
    "/usuarios/update/:id",
    upload.single('profileImage'), // Middleware Multer para subir imagen
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

            // Si se subió una imagen, guardar la ruta
            if (req.file) {
                profileImage = `images/profiles/${req.file.filename}`;
            }

            const user = await updateUser(id, username, email, role, profileImage);
            if (user == 0) {
                throw new AppError("Usuario no encontrado", 404);
            }

            res.status(200).json({ 
                mensaje: "Usuario actualizado",
                profileImage: profileImage // Devolver la ruta de la imagen si se actualizó
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /usuarios/upload-profile-image/{id}:
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
    "/usuarios/upload-profile-image/:id",
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
 * /usuarios/{id}:
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
    "/usuarios/:id",
    async (req, res, next) => {
        try {
            const { id } = req.params;
            
            if (!id) {
                throw new AppError("El id es requerido", 400);
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
 * /usuarios/delete/{id}:
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
    "/usuarios/delete/:id",
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

/**
 * @swagger
 * /usuarios:
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
    "/usuarios",
    async (req, res, next) => {
        try {
            const usuarios = await getUser();
            res.status(200).json(usuarios);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;