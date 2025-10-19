class AppError extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode;
        this.status = statusCode.toString().startsWith("4") ? "fail" : "error"; // Determina si es un error de cliente o servidor
        this.isOperational=true;

        Error.captureStackTrace(this, this.constructor); //Captura la pila de llamadas
    }
}

module.exports=AppError;