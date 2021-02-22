// const { json } = require('body-parser');
// const { application } = require('express');
const UserRepository = require('../../repositories/userRepository');
const userStorage = new UserRepository('./data/users.json');

function pagination(items, page=1, per_page=2){
    const start = (page-1)*per_page;
    return items.slice(start, start+per_page);
}

module.exports={
     getUsers(req, res){
        const itemsProm = userStorage.getUsers();
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
        itemsProm
            .then(items => 
                {
                const resItems = pagination(items, page, per);
                res.set("Content-type", "application/json");
                res.send(resItems);
            }).catch(err=>{
                res.status(400).send({});
            });
    },
    getUserById(req, res){
        const id = req.params.id;
        const PromUser = userStorage.getUserById(id);
        PromUser
            .then(user=>{
                res.send(user);
            })
            .catch(err=>{
                res.status(404).send({});
            });
    }
};