const router=require("express").Router();
const AppError=require("../errors/AppError");


const{
    createAsset,
    updateAsset,
    deleteAsset,
    getAsset,
    getAssets,

}=require("../controller/assetController");


/**
 * @swagger
 * /assets/create:
 *   post:
 *     summary: Crea un nuevo activo
 *     tags:
 *       - Activo
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
 *               rotulo:
 *                 type: string
 *               val_inicial:
 *                 type: number
 *                 format: decimal
 *               val_residual:
 *                 type: number
 *                 format: decimal
 *               dep_acomulada:
 *                 type: number
 *                 format: decimal
 *               departamentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Activo creado
 *       400:
 *         description: Campos requeridos faltantes
 *       500:
 *         description: Error de servidor
 */

router.post(
    "/assets/create",
    async(req,res,next)=>{
        try{
            const{nombre,codigo,rotulo,val_inicial,val_residual,dep_acomulada,departamentId}=req.body;
        
            if(!nombre || !codigo || !rotulo ||!val_inicial ||!val_residual || !dep_acomulada || !departamentId){
            throw new AppError("Todos los campos son requeridos",400);
            }
            if (val_inicial < 0 || val_residual < 0) {
                throw new AppError("Los valores deben ser positivos", 400);
            }

        const asset=await createAsset(
            nombre, 
            codigo, 
            rotulo, 
            val_inicial, 
            val_residual, 
            dep_acomulada, 
            departamentId
        );
        res.status(201).json(asset);

        }catch(error){
            next(error);
        }
            
    }
)


/**
 * @swagger
 * /assets/update/{id}:
 *   put:
 *     summary: Actualiza un activo existente
 *     tags:
 *       - Activo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del activo
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
 *               rotulo:
 *                 type: string
 *               val_inicial:
 *                 type: number
 *                 format: decimal
 *               val_residual:
 *                 type: number
 *                 format: decimal
 *               dep_acomulada:
 *                 type: number
 *                 format: decimal
 *               departamentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Activo actualizado
 *       400:
 *         description: El id es requerido o datos inválidos
 *       404:
 *         description: Activo no encontrado
 *       500:
 *         description: Error de servidor
 */


router.put(
    "/assets/update/:id",
    async(req,res,next)=>{
        try{
            const {id}=req.params;
            const{nombre,codigo,rotulo,val_inicial,val_residual,dep_acomulada,departamentId}=req.body;
            if(!id){
                throw new AppError("El id es requerido", 400);
            }
            if (val_inicial < 0) {
                throw new AppError("El valor inicial debe ser positivo", 400);
            }
            if (val_residual < 0) {
                throw new AppError("El valor residual debe ser positivo", 400);
            }

            const asset = await updateAsset(
                id, 
                nombre, 
                codigo, 
                rotulo, 
                val_inicial, 
                val_residual, 
                dep_acomulada, 
                departamentId
            );
            
            if (asset == 0) {
                throw new AppError("Activo no encontrado", 404);
            }

            res.status(200).json({ mensaje: "Activo actualizado" });

        }catch(error){
        next(error);
    }

    }
);

/**
 * @swagger
 * /assets/delete/{id}:
 *   delete:
 *     summary: Elimina un activo (soft delete)
 *     tags:
 *       - Activo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del activo
 *     responses:
 *       200:
 *         description: Activo eliminado
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Activo no encontrado
 *       500:
 *         description: Error de servidor
 */


router.delete(
    "/assets/delete/:id",
    async(req,res,next)=>{
        try{
            const{id}=req.params;
            if (!id) {
                throw new AppError("El id es requerido", 400);
            }
            const asset = await deleteAsset(id);
            if (asset == 0) {
                throw new AppError("Activo no encontrado", 404);
            }

            res.status(200).json({ mensaje: "Activo eliminado" })

        }catch(error){
            next(error);
        }
    }
);


/**
 * @swagger
 * /assets:
 *   get:
 *     summary: Obtiene una lista de todos los activos
 *     tags:
 *       - Activo
 *     responses:
 *       200:
 *         description: Lista de activos
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
    "/assets",
    async(req,res,next)=>{
        try{
            const assets = await getAssets();
            res.status(200).json(assets);
        }catch(error){
            next(error);
        }
    }
);

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     summary: Obtiene un activo por ID
 *     tags:
 *       - Activo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del activo
 *     responses:
 *       200:
 *         description: Activo encontrado
 *       400:
 *         description: El id es requerido
 *       404:
 *         description: Activo no encontrado
 *       500:
 *         description: Error de servidor
 */


router.get(
    "/assets/:id",
    async(req,res,next)=>{
        try{
            const {id}=req.params;
            if (!id) {
                throw new AppError("El id es requerido", 400);
            }
            const asset = await getAsset(id);
            if (!asset) {
                throw new AppError("Activo no encontrado", 404);
            }

            res.status(200).json(asset);

        }catch(error){
            next(error)
        }
    }
);

module.exports = router;