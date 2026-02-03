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
            
            // 1. Verificar integridad del Token
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            } catch (jwtError) {
                const msg = jwtError.name === 'TokenExpiredError' ? "Token expirado" : "Token inválido";
                return next(new AppError(msg, 401));
            }

            // 2. Buscar usuario en DB (para tener el rol actualizado en tiempo real)
            const user = await User.findByPk(decodedToken.id, {
                include: [{
                    model: Departament,
                    as: 'departamentoResponsable',
                    attributes: ['id', 'nombre', 'codigo']
                }]
            });

            if (!user) {
                return next(new AppError("Usuario ya no existe en el sistema", 401));
            }

            // 3. Autorización por Roles
            if (roles.length > 0) {
                
                const userRole = user.role.toLowerCase();
                const allowedRoles = roles.map(r => r.toLowerCase());

                if (!allowedRoles.includes(userRole)) {
                    return next(new AppError("No tienes permisos (rol insuficiente) para esta acción", 403));
                }
            }

            
            req.user = user;
            req.userRole = user.role;
            req.departmentId = user.departamentoResponsable?.id || null;

            next();
        } catch (error) {
            return next(new AppError("Error interno en el proceso de autenticación", 500));
        }
    };
};

module.exports = authenticate;