const router =require("exrpress")
//const AppError=require("../")
//const authenticate=require("../")

const{
    createUser,
    deleteUser,
    getUser,
    updateUser, 
}=require("../controller/userController");

router.post(
    "usuarios/create",
    async(req,res,next)=>{
        try{
            const{ username, email, role } = req.body;

            if(!username ||!email){
                throw new AppError("Todos lso campos son requeridos",400);
            }
            const user=await createUser(username,email,role);
        }catch(error){
            next(error);
        }
    }
);


router.put(
    router.put(
        "/usuarios/update/:id",
        async (req, res, next) => {
          //:id es para rcibir parametros
          try {
            const { username, email } = req.body;
            const { id } = req.params;
      
            if (!id) {
              throw new AppError("El id es requerido", 400);
            }
      
            if (!username) {
              throw new AppError("Todos los campos son reuqeridos", 400);
            }
            const usuario = await updateUser(id, username);
            if (usuario == 0) {
              throw new AppError("Usuario no encontrado", 404);
            }
      
            res.status(200).json({ mensaje: "Usuario actualizado " });
          } catch (error) {
            next(error); //Error de servidor 500
          }
        }  
    )
);