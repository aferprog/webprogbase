const UserRepository = require('./userRepository');
const userStorage = new UserRepository();
const amqp = require('amqplib');
const jwt = require("jsonwebtoken");
const jwtSekret = "sekret";

function pagination(items, page=1, per_page=2){
    const start = (page-1)*per_page;
    return items.slice(start, start+per_page);
}

module.exports={
    'login': (req, callback) => {
        const PromUser = userStorage.getUsers({login: req.body.login, password: req.body.password});
        PromUser
            .then(users=>{
                console.log(users);
                if (users.length>0){
                        const user = users[0];
                        callback(null, jwt.sign({_id: user._id, login: user.login}, jwtSekret));
                    }
                else
                    callback(null, false);
            })
            .catch(err=>{
                console.log(err);
                callback(err);
            });
    },
    'getUsers': (req, callback) => {
        let page = req.body.page;
        let per = req.body.per_page;
        const itemsProm = userStorage.getUsers();
        itemsProm
            .then(items => {
                const resItems = pagination(items, page, per);
                callback(null, resItems);
            }).catch(err=>{
                console.log(err);
                callback(err);
            });
    },
    'getUserById': (req, callback) => {
        let id;
        if (req.body.token) {
            try{
                const user = jwt.verify(req.body.token, jwtSekret);
                id = user._id;
            } catch(err){
                console.log(err);
                callback(err);
                return;
            }
        } else id = req.body.id;
        const PromUser = userStorage.getUserById(id);
        PromUser
            .then(user=>{
                callback(null, user);
            })
            .catch(err=>{
                console.log(err);
                callback(err);
            });
    },
    'usernameExists': (req.body, callback) => {
        const login = req.body.login;
        const PromUser = userStorage.getUsers({login: login});
        PromUser
            .then(users=>{
                if (users.length>0)
                    callback(null, true);
                else
                    callback(null, false);
            })
            .catch(err=>{
                console.log(err);
                callback(err);
            });
    },
    'addUser': (req.body, callback)=>{
        let user1;
        const login = req.body.login;
        const password = req.body.password;
        const fullname = req.body.fullname;
        let user= {
            'login': login,
            'password': password,
            'fullname': fullname
        };
        user = userStorage.addUser(user);
        user.then(user=>{
            user1 = user;
            callback(null, {
                '_id': user._id,
                'login': user.login,
                'registeredAt': user.registeredAt
            });
            return amqp.connect('amqp://localhost');
        }).catch(err=>{
            console.log(err);
            callback(err);
        }).then(connection=>{
            console.log(connection);
            return connection.createChannel();
        }).then(channel => {
            const queue = 'registration';
            channel.assertQueue(queue);
            channel.sendToQueue(queue, JSON.stringify(user1));
        })
        .catch(err => console.log(`amqp`, err));
    }
};