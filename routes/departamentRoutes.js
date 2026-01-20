const router =require("express").Router();
const AppError =require("../errors/AppError");

const {createDepartment,deleteDepartment,getDepartment,updateDepartment,getDepartments}=require("../controller/departamentController");

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
    "/departments/create",
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
    "/departments/update/:id",
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
    "/departments/delete/:id",
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
    "/departments",
    async(req,res,next)=>{
        try{
            const departments=await getDepartments();
            res.status(200).json(departments);
        }catch(error){
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
    "/departments/:id",
    async(req,res,next)=>{
        try{
            const{id}=req.params;
            if(!id){
                throw new AppError("El id es requerido ",400);
            }
            const departament=await getDepartment(id);
            if(!departament){
                throw new AppError("Departamento no encontrado",404);
            }
            res.status(200).json(departament);
        }catch(error){
            next(error);
        }
    }
);

module.exports = router;
