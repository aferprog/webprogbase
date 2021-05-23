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
    getWeapons(msg, callback){
        const items = weponStorage.getWepons();
        let page = msg.page;
        let per = msg.per_page;
        items.then(items =>{
            const resItems = pagination(items, page, per);
            callback(null, resItems);
        }).catch(err=>{
            console.log(err);
            callback(err);
        });
    },
    getWeaponById(msg, callback){
        const id = msg.id;
        const wepon = weponStorage.getWeponById(id);
        if (wepon===null) {
            callback(404);
            return;
        }
        wepon.then(wepon=>{
            callback(null, wepon);
        }).catch(err=>{
            console.log(err);
            callback(err);
        });
    },
    async deleteWeapon(msg, callback){
        const id = msg._id;
        try{
            const f = await check(id, msg.token);
            if (!f) callback("no rule");
        }
        catch(err){
            console.log(err);
            callback("deny")
        }
        const delItem = weponStorage.deleteWepon(id);
        delItem.then(delItem=>{
            console.log(delItem);
            callback(null, JSON.stringify(delItem));
        }).catch(err=>{
            console.log(err);
            callback(err);
        });
    },
    async updateWeapon(msg, callback){
        let user;
        try{
            user = jwt.verify(msg.token, jwtSekret);
            const f = await check(msg._id, msg.token);
            console.log(f);
            if (!f) {
                callback("no rule");
                return;
            }
            
        }
        catch(err){
            console.log(err);
            callback("deny");
            return;
        }

        let wepon = {
            _id: msg._id,
        };
        if (msg.name) wepon.name = msg.name;
        if (msg.damage) wepon.damage = msg.damage;
        if (msg.speed) wepon.speed = msg.speed;

        const old = weponStorage.updateWepon(wepon);
        old.then(oldWep => {
            console.log(oldWep);
            console.log("CHECK");
            callback(null, JSON.stringify(oldWep));
        })
        .catch(err=>{
            console.log(err);
            callback(err);
        });
    },
    addWeapon(msg, callback){
        let user;
        try{
            user = jwt.verify(msg.token, jwtSekret);
        } catch(err) {
            console.log(err);
            callback(err);
            return;
        }
        const name = msg.name;
        const author = user._id;
        const damage = msg.damage;
        const speed = msg.speed;
        let wepon= {
            'name': name,
            'author': author,
            'damage': Number(damage), 
            'speed': Number(speed)
        };
        console.log(wepon);
        wepon = weponStorage.addWepon(wepon);
        wepon.then(wepon=>{
            callback(null, wepon);
        }).catch(err=>{
            console.log(err);
            callback(err);
        });
    }
};