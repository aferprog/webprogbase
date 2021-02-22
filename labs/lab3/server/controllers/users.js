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
        let search = req.query.name;
        if (typeof search === 'undefined') search='';
        const items = userStorage.getUsers().filter(user =>user['fullname'].indexOf(search)>=0);
        let page = req.query.page;
        let per = req.query.per_page;
        if (typeof page === 'undefined') page = 1, console.log("u1");
            else page=Number(page);
        if (typeof per === 'undefined') per = 2, console.log("u2");
            else per=Number(per);

        if (isNaN(page) || isNaN(per) || page <=0 || per <=0){
            
            res.status(400).render('users',{});
            return;
        }
        
        const resItems = pagination(items, page, per);
        res.render('users', {resItems, search});
    },
    getUserById(req, res){
        const str_id = req.params.id;
        const id = Number(str_id);
        const user = userStorage.getUserById(id);
        if (user===null) {
            res.status(404).render('user',{});
            return;
        }
        res.render('user',user);
    }
};