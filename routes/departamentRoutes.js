const router =require("express").Router();
const AppError =require("../errors/AppError");
const authenticate = require("../middlewares/authenticateJswt");

const {createDepartment,deleteDepartment,getDepartment,updateDepartment,getDepartments,countDepartments}=require("../controllers/departamentController");

/**
 * @swagger
 * /departments/create:
 *   post:
 *     summary: Crea un nuevo departamento
 *     tags:
 *       - Departamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               responsableId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Departamento creado
 *       400:
 *         description: Todos los campos son requeridos
 *       500:
 *         description: Error de servidor
 */

router.post(
    "/create",
    authenticate(['admin']), // Solo admins pueden crear departamentos
    async(req,res,next)=>{
        try{
            const{nombre,codigo,responsableId}=req.body;
            if (!nombre || !codigo) {
                throw new AppError("Nombre y código son requeridos", 400);
            }
            const department=await createDepartment(nombre,codigo,responsableId);
            res.status(201).json(department);
        }catch(error){
            next(error);
        }
    }
);

/**
 * @swagger
 * /departments/update/{id}:
 *   put:
 *     summary: Actualiza un departamento existente
 *     tags:
 *       - Departamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               responsableId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Departamento actualizado
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Departamento no encontrado
 *       500:
 *         description: Error de servidor
 */

router.put(
    "/:id",
    authenticate(['admin']), // Solo admins pueden actualizar departamentos
    async(req,res,next)=>{
        try{
            const{nombre,codigo,responsableId}=req.body;
            const{id}=req.params;

            if (!id) {
                throw new AppError("El id es requerido", 400);
            }
            const department = await updateDepartment(id, nombre, codigo, responsableId);
            if (department == 0) {
                throw new AppError("Departamento no encontrado", 404);
            }
            res.status(200).json({ mensaje: "Departamento actualizado" });
        }catch(error){
            next(error);
        }
    }
);

/**
 * @swagger
 * /departments/delete/{id}:
 *   delete:
 *     summary: Elimina un departamento
 *     tags:
 *       - Departamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Departamento eliminado
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Departamento no encontrado
 *       500:
 *         description: Error de servidor
 */


router.delete(
    "/:id",
    authenticate(['admin']), // Solo admins pueden eliminar departamentos
    async(req,res,next)=>{
        try{
            const{id}=req.params;
            if(!id){
                throw new AppError("El id es requerido",400);
            }
            const department = await deleteDepartment(id);
            if(department==0){
                throw new AppError("Departamento no encontrado",404);
            }
            res.status(200).json({mensaje : "Departamento eliminado"});
        }catch(error){
            next(error);
        }
    }
);


/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Obtiene una lista de departamentos
 *     tags:
 *       - Departamento
 *     responses:
 *       200:
 *         description: Lista de departamentos
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
    authenticate(['admin', 'responsable']), // Usuarios autenticados
    async(req,res,next)=>{
        try{
            const departments = await getDepartments();
            res.status(200).json(departments);
        }catch(error){
            next(error);
        }
    }
);
/**
 * @swagger
 * /departments/count:
 *   get:
 *     summary: Obtiene el número total de departamentos
 *     description: Retorna el conteo total de departamentos registrados en el sistema
 *     tags:
 *       - Departamento
 *     responses:
 *       200:
 *         description: Conteo total de departamentos obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de departamentos
 *                   example: 25
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al conectar con la base de datos"
 */
router.get(
    "/count",
    authenticate(['admin', 'responsable']),
    async (req, res, next) => {
        try {
            const total = await countDepartments();
            res.status(200).json({ total });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Obtiene un departamento por ID
 *     tags:
 *       - Departamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Departamento encontrado
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Departamento no encontrado
 *       500:
 *         description: Error de servidor
 */

router.get(
    "/:id",
    authenticate(['admin', 'responsable']), // Usuarios autenticados
    async(req,res,next)=>{
        try{
            const{id}=req.params;
            if(!id){
                throw new AppError("El id es requerido",400);
            }

            // Los responsables solo pueden ver su departamento
            if (req.userRole === 'responsable' && parseInt(id) !== req.departmentId) {
                throw new AppError("Solo puedes ver tu departamento", 403);
            }

            const department=await getDepartment(id);
            if(!department){
                throw new AppError("Departamento no encontrado",404);
            }

            res.status(200).json(department);
        }catch(error){
            next(error);
        }
    }
);


module.exports = router;
