const AppError = require("../errors/AppError");
const Asset = require('../models/asset');
const Departament = require('../models/departament');

/**
 * Middleware para verificar que los responsables solo puedan acceder a activos de su departamento
 */
const checkDepartmentAssetAccess = async (req, res, next) => {
    try {
        // Los admins pueden acceder a todo
        if (req.userRole === 'admin') {
            return next();
        }

        // Verificar que el usuario tenga un departamento asignado
        const departmentId = req.departmentId;
        if (!departmentId) {
            return next(new AppError("No tienes asignado ningún departamento", 403));
        }

        const { id } = req.params;
        
        // Para PUT y DELETE, verificar que el activo pertenezca al departamento del usuario
        if (req.method === 'PUT' || req.method === 'DELETE') {
            const asset = await Asset.findByPk(id);
            
            if (!asset) {
                return next(new AppError("Activo no encontrado", 404));
            }

            if (asset.departamentId !== departmentId) {
                return next(new AppError("No tienes permisos para gestionar este activo", 403));
            }
        }

        // Para POST, verificar que el departamentId del body coincida con el del usuario
        if (req.method === 'POST') {
            const { departamentId } = req.body;
            
            if (!departamentId) {
                return next(new AppError("El departamento es requerido", 400));
            }

            if (departamentId !== departmentId) {
                return next(new AppError("Solo puedes crear activos para tu departamento", 403));
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = checkDepartmentAssetAccess;
