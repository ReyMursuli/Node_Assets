const Asset=require("../models/asset");


const createAsset=async(nombre,codigo,rotulo,valInicial,valResidual,depAcomulada,idDepartament)=>{
    const asset=await Asset.create({
        nombre,
        codigo,
        rotulo,
        valInicial,
        valResidual,
        depAcomulada,
        idDepartament,
    });
    return asset;
};

const getAssets=async()=>{
    const assets=await Asset.findAll({
        include:[{
            association:'Departament',
            attributes: ['id', 'nombre', 'codigo']
        }],
        paranoid:false
    });
    return assets;
}

const deleteAsset=async(id)=>{
    const asset=await Asset.destroy({where:{id}});
    return asset;
};

const updateAsset=async(id,nombre,codigo,rotulo,valInicial,valResidual,depAcomulada,idDepartament)=>{
    let updateData={nombre,codigo,rotulo,valInicial,valResidual,depAcomulada,idDepartament};
    const asset=await Asset.update(updateData,{where:{id}});
    return asset;
};

const getAsset = async (id) => {
    const asset = await Asset.findByPk(id, {
        include: [{
            association: 'Departament',
            attributes: ['id', 'nombre', 'codigo']
        }]
    });
    return asset;
};


module.exports={
    createAsset,
    updateAsset,
    deleteAsset,
    getAsset,
    getAssets
};