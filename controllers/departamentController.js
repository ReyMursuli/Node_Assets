const Departament=require("../models/departament");

const createDepartment= async(nombre,codigo,responsableId=null)=>{
    const departament=await Departament.create({nombre,codigo,responsableId});
    return departament;
};

const updateDepartment= async(id,nombre,codigo,responsableId=null)=>{
    const updateData={nombre,codigo,responsableId};
    const department = await Departament.update(updateData, { where: { id } });
    return department;
};

const deleteDepartment=async(id)=>{
    const departament=await Departament.destroy({where :{id}});
    return departament;
};

const getDepartment=async(id)=>{
    const department = await Departament.findByPk(id, {
        include: [{
            association: 'User',  // Según la relación que definas
            attributes: ['id', 'username', 'email']
        }]
    });
    return department;
};


const getDepartments=async()=>{
    const departments = await Departament.findAll({
        include: [{
            association: 'User',
            attributes: ['id', 'username', 'email']
        }]
    });
    return departments;
};

const countDepartments=async()=>{
    const count = await Departament.count();
    return count;
}

module.exports={
    createDepartment,updateDepartment,deleteDepartment,getDepartment,getDepartments,countDepartments
};