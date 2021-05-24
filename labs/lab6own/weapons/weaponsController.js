const WeponRepository = require('./weaponRepository');
const weponStorage = new WeponRepository();
const jwt = require('jsonwebtoken');
const jwtSekret = "sekret";


function pagination(items, page=1, per_page=2){
    const start = (page-1)*per_page;
    return items.slice(start, start+per_page);
}

function check(id, token){
    return weponStorage.getWeponById(id)
        .then(weapon=>{
            const user = jwt.verify(token, jwtSekret);

            if (weapon.author == user._id) return true;
                else return false;
        }); 
}

module.exports={
    getWeapons(req, res){
        const items = weponStorage.getWepons();
        let page = req.query.page;
        let per = req.query.per_page;
        items.then(items =>{
            const resItems = pagination(items, page, per);
            res.send(resItems);
        }).catch(err=>{
            console.log(err);
            res.send(400);
        });
    },
    getWeaponById(req, res){
        const id = req.query.id;
        const wepon = weponStorage.getWeponById(id);
        if (wepon===null) {
            res.send(404);
            return;
        }
        wepon.then(wepon=>{
            res.send(wepon);
        }).catch(err=>{
            console.log(err);
            res.send(404);
        });
    },
    async deleteWeapon(req, res){
        const id = req.body._id;
        try{
            const f = await check(id, req.body.token);
            if (!f) res.send("no rule");
        }
        catch(err){
            console.log(err);
            res.send("deny")
        }
        const delItem = weponStorage.deleteWepon(id);
        delItem.then(delItem=>{
            console.log(delItem);
            res.send(null, JSON.stringify(delItem));
        }).catch(err=>{
            console.log(err);
            res.send(err);
        });
    },
    async updateWeapon(req, res){
        let user;
        try{
            user = jwt.verify(req.body.token, jwtSekret);
            const f = await check(req.body._id, req.body.token);
            console.log(f);
            if (!f) {
                res.send("no rule");
                return;
            }
            
        }
        catch(err){
            console.log(err);
            res.send("deny");
            return;
        }

        let wepon = {
            _id: req.body._id,
        };
        if (req.body.name) wepon.name = req.body.name;
        if (req.body.damage) wepon.damage = req.body.damage;
        if (req.body.speed) wepon.speed = req.body.speed;

        const old = weponStorage.updateWepon(wepon);
        old.then(oldWep => {
            console.log(oldWep);
            res.send(null, JSON.stringify(oldWep));
        })
        .catch(err=>{
            console.log(err);
            res.send(err);
        });
    },
    addWeapon(req, res){
        let user;
        try{
            user = jwt.verify(req.body.token, jwtSekret);
        } catch(err) {
            console.log(err);
            res.send(err);
            return;
        }
        const name = req.body.name;
        const author = user.body._id;
        const damage = req.body.damage;
        const speed = req.body.speed;
        let wepon= {
            'name': name,
            'author': author,
            'damage': Number(damage), 
            'speed': Number(speed)
        };
        console.log(wepon);
        wepon = weponStorage.addWepon(wepon);
        wepon.then(wepon=>{
            res.send(wepon);
        }).catch(err=>{
            console.log(err);
            res.send(err);
        });
    }
};