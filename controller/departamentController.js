const Departament=require("../models/departament");

const createDepartment= async(nombre,codigo,responsaliId=null)=>{
    const departament=await Departament.create({nombre,codigo,responsaliId});
    return departament;
};

const updateDepartment= async(id,nombre,codigo,responsaliId=null)=>{
    const updateData={nombre,codigo,responsaliId};
    const department = await Department.update(updateData, { where: { id } });
    return department;
};

const deleteDepartment=async(id)=>{
    const departament=await Departament.destroy({where :{id}});
    return departament;
};

const getDepartment=async(id)=>{
    const department = await Department.findByPk(id, {
        include: [{
            association: 'User',  // Según la relación que definas
            attributes: ['id', 'username', 'email']
        }]
    });
    return department;
};


const getDepartments=async()=>{
    const departments = await Department.findAll({
        include: [{
            association: 'User',
            attributes: ['id', 'username', 'email']
        }]
    });
    return departments;
};

module.exports={
    createDepartment,updateDepartment,deleteDepartment,getDepartment,getDepartments
};