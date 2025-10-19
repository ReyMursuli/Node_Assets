const router =require("express").Router();
const AppError=require("../errors/AppError");
//const authenticate=require("../")

const{
    createUser,
    deleteUser,
    getUser,
    updateUser, 
}=require("../controller/userController");

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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
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
    async(req,res,next)=>{
        try{
            const{ username, email, role } = req.body;

            if(!username ||!email){
                throw new AppError("Todos los campos son requeridos",400);
            }
            const user=await createUser(username,email,role);
        }catch(error){
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
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
  
  async (req, res, next) => {
    //:id es para rcibir parametros
    try {
      const { username, role,email } = req.body;
      const { id } = req.params;

      if (!id) {
        throw new AppError("El id es requerido", 400);
      }

      if (!username) {
        throw new AppError("Todos los campos son reuqeridos", 400);
      }

      if (!role) {
        throw new AppError("Todos los campos son reuqeridos", 400);
      }

      if (!email) {
        throw new AppError("Todos los campos son reuqeridos", 400);
      }

      const user = await updateUser(id, username, email);
      if (user == 0) {
        throw new AppError("Usuario no encontrado", 404);
      }

      res.status(200).json({ mensaje: "Usuario actualizado " });
    } catch (error) {
      next(error); //Error de servidor 500
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
    try{
      const{id}=req.params;

      if(!id){
        throw new AppError("El id es requerido",400);
     }

      const user=await deleteUser(id);
      if (user == 0) {
        throw new AppError("Usuario no encontrado", 404);
      }
      res.status(200).json({mensaje:"Usuario eliminado"})

    }catch (error) {
        next(error); //Error de servidor 500
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
      next(error); //Error de servidor 500
    }
  }
);