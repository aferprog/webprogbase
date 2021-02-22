const AmmoRepo = require("../../repositories/ammoRepository");
const AmmoStorage = new AmmoRepo();
function pagination(items, page=1, per_page=2){
    const start = (page-1)*per_page;
    return items.slice(start, start+per_page);
}


module.exports={

    getAmmo(req, res){
        const items = AmmoStorage.getAmmo();
        let page = req.query.page;
        let per = req.query.per_page;
        if (typeof page === 'undefined') page = 1;
            else page=Number(page);
        if (typeof per === 'undefined') per = 2;
            else per=Number(per);

        if (page <=0 || per <=0){
            res.status(400).send({});
            return;
        }
        items.then(items =>{
            const resItems = pagination(items, page, per);
            res.set("Content-type", "application/json");
            res.send(resItems);
        })
        .catch(err=>{
            res.status(400).send("Bad request");
        });
    },
    getAmmoById(req, res){
        const id = req.params.id;
        const ammo = AmmoStorage.getAmmoById(id);
        ammo.then(ammo=>{
                res.set("Content-type", "application/json");
                res.send(ammo);
        }).catch(err=>{
            res.status(404).send({});
        });
    },
    deleteAmmo(req, res){
        const id = req.params.id;
        const delItem = AmmoStorage.deleteAmmo(id);
        delItem.then(delItem=>{
            res.set("Content-type", "application/json");
            res.send(delItem);
        })
        .catch(err=>{
            res.status(404).send({});
        });
    },
    updateAmmo(req, res){
        let ammo={
            _id: req.body._id,
            name: req.body.name,
            author: req.body.stability,
            penetration: req.body.penetration
        };
        const old = AmmoStorage.updateAmmo(ammo);
        old.then(ammo => {
            res.set("Content-type", "application/json");
            res.send(ammo);
        })
            .catch(err=>{
                res.status(400).send({});
            });
    },
    addAmmo(req,res){
        const name = req.body.name;
        const stability = req.body.stability;
        const penetration = req.body.penetration;        
        let ammo= {
            'name': name,
            'stability': Number(stability), 
            'penetration': Number(penetration)
        };
        ammo = AmmoStorage.addAmmo(ammo);
        ammo.then(ammo=>{
            res.status(201).set("Content-type", "application/json");
            res.send(ammo);
        }).catch(err=>{
            res.status(400).send({});
        });;
        
    }
};