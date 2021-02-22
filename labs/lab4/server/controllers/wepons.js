// const { json } = require('body-parser');
// const { application } = require('express');
// const { query } = require('express');
const WeponRepository = require('../../repositories/weponRepository');
const weponStorage = new WeponRepository();

function pagination(items, page=1, per_page=2){
    const start = (page-1)*per_page;
    return items.slice(start, start+per_page);
}

module.exports={
    getWepons(req, res){
        const items = weponStorage.getWepons();
        let page = req.query.page;
        let per = req.query.per_page;
        if (typeof page === 'undefined') page = 1;
            else page=Number(page);
        if (typeof per === 'undefined') per = 2;
            else per=Number(per);

        if (isNaN(page) || isNaN(per) || page <=0 || per <=0){
            res.status(400).send({});
            return;
        }
        items.then(items =>{
            const resItems = pagination(items, page, per);
            res.set("Content-type", "application/json");
            res.send(resItems);
        }).catch(err=>{
            res.status(400).send({});
        });;
    },
    getWeponById(req, res){
        const id = req.params.id;
        const wepon = weponStorage.getWeponById(id);
        if (wepon===null) {
            res.status(404).send({});
            return;
        }
        wepon.then(wepon=>{
            res.set("Content-type", "application/json");
            res.send(wepon);
        }).catch(err=>{
            res.status(404).send({});
        });;
    },
    deleteWepon(req, res){
        const id = req.params.id;
        const delItem = weponStorage.deleteWepon(id);
        delItem.then(delItem=>{
            res.set("Content-type", "application/json");
            res.send(delItem);
        }).catch(err=>{
            res.status(404).send({});
        });;
    },
    updateWepon(req, res){
        let wepon={
            _id: req.body._id,
            name: req.body.name,
            author: req.body.author,
            damage: req.body.damage,
            speed: req.body.speed,
            createdAt: req.body.createdAt,
            ammo: req.body.ammo
        };
        const old = weponStorage.updateWepon(wepon);
        old.then(wepon => {
            res.set("Content-type", "application/json");
            res.send(wepon);
        })
            .catch(err=>{
                res.status(400).send({});
            });
    },
    addWepon(req,res){
        // console.log(req.body);
        // res.status(201).set("Content-type", "application/json");
        // res.send({});
        const name = req.body.name;
        const author = req.body.author;
        const damage = req.body.damage;
        const speed = req.body.speed;
        const ammo = req.body.ammo;
        //const date = new Date();
        let id;
        if (name.length>0 && author.length>0 && 
            !isNaN(damage) && damage>=0 && !isNaN(speed) && speed>0){
            let wepon= {
                'name': name,
                'author': author,
                'damage': Number(damage), 
                'speed': Number(speed),
                'ammo': ammo,
            };
            wepon = weponStorage.addWepon(wepon);
            wepon.then(wepon=>{
                res.status(201).set("Content-type", "application/json");
                res.send(wepon);
            }).catch(err=>{
                res.status(404).send({});
            });;
        }
        else {
            res.set("Content-type", "application/json");
            res.status(400).send({});
        }
        
    }
};