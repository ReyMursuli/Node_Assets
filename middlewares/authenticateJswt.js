const jwt = require('jsonwebtoken');
const AppError = require("../errors/AppError");
const User = require('../models/user');
const Departament = require('../models/departament');

const authenticate = (roles = []) => {
    return async function(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(new AppError("Token de autenticación no proporcionado", 401));
            }

            const token = authHeader.split(" ")[1];
            
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
                
                // Verificar roles permitidos
                if (roles.length > 0 && !roles.includes(decodedToken.role)) {
                    return next(new AppError("No tienes el rol necesario para realizar esta acción", 403));
                }

                // Buscar usuario actualizado con su departamento
                const user = await User.findOne({
                    where: { id: decodedToken.id },
                    include: [{
                        model: Departament,
                        as: 'departamentoResponsable',
                        attributes: ['id', 'nombre', 'codigo']
                    }]
                });

                if (!user) {
                    return next(new AppError("Usuario no encontrado", 401));
                }

                // Adjuntar datos del usuario a la request
                req.user = user;
                req.userRole = user.role;
                req.departmentId = user.departamentoResponsable?.id || null;
                req.userData = { userId: user.id }; // Compatibilidad con código existente

                next();
            } catch (jwtError) {
                if (jwtError.name === 'TokenExpiredError') {
                    return next(new AppError("Token expirado", 401));
                }
                if (jwtError.name === 'JsonWebTokenError') {
                    return next(new AppError("Token inválido", 401));
                }
                return next(new AppError("Error de autenticación", 401));
            }
        } catch (error) {
            return next(new AppError("Error de autenticación", 500));
        }
    };
};

module.exports = authenticate;