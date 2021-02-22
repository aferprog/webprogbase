const MediaRepository = require('../../repositories/mediaRepository');
const media = new MediaRepository('./data/media');
const WeponRepository = require('../../repositories/weponRepository');
const weponStorage = new WeponRepository('./data/wepons.json');

function countOfPages(items, per){
    const k=items.length;
    return Math.ceil(k/per);
}

function pagination(items, page=1, per_page=2){
    const start = (page-1)*per_page;
    return items.slice(start, start+per_page);
}

module.exports={
     getWepons(req, res){
        let search = req.query.name;
        if (typeof search === 'undefined') search='';
        const items = weponStorage.getWepons().filter(wepon => wepon['name'].indexOf(search)>=0);
        let page = req.query.page;
        let per = req.query.per_page;
        if (typeof page === 'undefined') page = 1, console.log("u1");
            else page=Number(page);
        if (typeof per === 'undefined') per = 2, console.log("u2");
            else per=Number(per);

        if (isNaN(page) || isNaN(per) || page <=0 || per <=0){
            res.status(400).render('wepons', {});
            return;
        }
        let prev, next;
        if (page==1)
            prev = [];
          else prev = [page-1];

        if (page==countOfPages(items,per))
            next = [];
          else next = [page+1];
        
        const resItems = pagination(items, page, per);
        res.render('wepons', {resItems, search, count: countOfPages(items,per), prev, next, per});
    },
    getWeponById(req, res){
        const str_id = req.params.id;
        const id = Number(str_id);
        const wepon = weponStorage.getWeponById(id);
        if (wepon===null) {
            res.status(404).render('wepon', {});
            return;
        }
        res.render('wepon', wepon);
    },
    deleteWepon(req, res){
        const str_id = req.params.id;
        const id = Number(str_id);
        const delItem = weponStorage.deleteWepon(id);
        if (delItem === null) {
            res.status(404).send({});
            return;
        }
        res.redirect('/wepons');
    },
    updateWepon(req, res){
        // console.log(req.body);
        const str_id=req.body.id;
        const id = Number(str_id);
        if (isNaN(id)) {
            res.status(400).send({});
            return;
        }
        const wepon_ = weponStorage.getWeponById(id);
        // console.log(wepon_);
        if (wepon_ ===null) {
            res.status(404).send({});
            return;
        }
        let wepon={
            id: wepon_.id,
            name: wepon_.name,
            author: wepon_.author,
            damage: wepon_.damage,
            speed: wepon_.speed,
            createdAt: wepon_.date
        };

        const name = req.body.name;
        const author = req.body.author;
        const str_damage = req.body.damage;
        const str_speed = req.body.speed;
        if (name!=="") wepon.name=name;
        if (author!=="") wepon.author=author;
        const damage = Number(str_damage);
        const speed = Number(str_speed);
        if (isNaN(damage)){
            res.set("Content-type", "application/json");
            res.status(400).send({});
            return;
        }
        if (str_damage!=="") wepon.damage=Number(damage);
        if (isNaN(speed)){
            res.set("Content-type", "application/json");
            res.status(400).send({});
            return;
        }
        if (str_speed!=="") wepon.speed=Number(speed);

        weponStorage.updateWepon(wepon);
        res.set("Content-type", "application/json");
        res.send(wepon_);
    },
    addWepon(req,res){
        console.log(req.body, req.file);
        const name = req.body.name;
        const author = req.body.author;
        const damage = req.body.damage;
        const speed = req.body.speed;
        const date = new Date();
        let id;
        if (name.length>0 && author.length>0 && 
            !isNaN(damage) && damage>=0 && !isNaN(speed) && speed>0){
            const url = '/media/' + media.getNextId()+'.jpeg';
            id = weponStorage.addWepon(name, author, Number(damage), Number(speed), date, url);
            res.redirect('/wepons/'+id);
        }
        else {
            res.set("Content-type", "application/json");
            res.status(400).send({});
        }
    }
};