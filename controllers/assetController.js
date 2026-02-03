const Asset=require("../models/asset");


const createAsset = async (nombre, codigo, rotulo, val_inicial, val_residual, dep_acomulada, departamentId) => {
    const asset = await Asset.create({
        nombre,
        codigo,
        rotulo,
        val_inicial,      
        val_residual,     
        dep_acomulada,     
        departamentId, 
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
    const asset=await Asset.destroy(
        {where:{id},
        force: true });
    return asset;
};

const updateAsset=async(id,nombre,codigo,rotulo,val_inicial,val_residual,dep_acomulada,departamentId)=>{
    let updateData={nombre,codigo,rotulo,val_inicial,val_residual,dep_acomulada,departamentId};
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
const countAssets = async () => {
    const count = await Asset.count();
    return count;
}

module.exports={
    createAsset,
    updateAsset,
    deleteAsset,
    getAsset,
    getAssets,
    countAssets
};