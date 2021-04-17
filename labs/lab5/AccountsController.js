const ChatController = require('./ChatController');
const chatController = require('./ChatController');

/*class User{
    constructor(login, telegramLogin=null,room=null,wsConnection=null, rpcConnection=null, telegramConnection=null){
        this.login=login;
        this.telegramLogin=telegramLogin;
        this.room=room;
        this.wsConnection=wsConnection;
        this.rpcConnection=rpcConnection;
        this.telegramConnection=telegramConnection;
    }
}*/
class User{
    constructor(obj){
        if (!obj.login) throw new Error("Login is required for creating new Account!");
            else this.login = obj.login;
        if (obj.telegramLogin) this.telegramLogin=obj.telegramLogin;
            else this.telegramLogin=null;
        if (obj.room) this.room=obj.room;
            else this.room=null;
        if (obj.wsConnection) this.wsConnection=obj.wsConnection;
            else this.wsConnection=null;
        if (obj.rpcConnection) this.rpcConnection=obj.rpcConnection;
            else this.rpcConnection=null;
        if (obj.telegramConnection) this.telegramConnection=obj.telegramConnection;
            else this.telegramConnection=null;
    }
}
class AccountsController{
    constructor(){
        this.accounts = [];
        this.wsSend = undefined;
        this.rpcSend = undefined;
        this.telegramSend = undefined;
    }
    addAccount(user){
        const x = this.accounts.findIndex(user1=>{
            return user1.login===user.login;
        });
        if (x === -1){ // login not found
            if (this.getUser({telegramLogin: user.telegramLogin})) throw new Error("This telegram is already registered.");

            let res = new User(user);
            this.accounts.push(res);
            return {
                isLoginNew: true,
                isTelegramLoginCorrect: false,
                room: null
            };
        }
        if(this.accounts[x].wsConnection && user.wsConnection){
            throw new Error("Web-soket is already using by this user");
        }
        // if(this.accounts[x].rpcConnection && user.rpcConnection){
        //     throw new Error("Web-soket is already using by this user");
        // }

        if (this.accounts[x].telegramLogin && user.telegramLogin!==this.accounts[x].telegramLogin){
            console.log("Corret login is: ", this.accounts[x].telegramLogin);
            return {
                isLoginNew: false,
                isTelegramLoginCorrect: false,
                room: null
            };
        }

        if(!this.accounts[x].wsConnection && user.wsConnection){
            this.accounts[x].wsConnection = user.wsConnection;
        }

        if(!this.accounts[x].rpcConnection && user.rpcConnection){
            this.accounts[x].rpcConnection = user.rpcConnection;
        }

        if (user.telegramConnection){
            // if (this.accounts[x].telegramLogin && user.telegramLogin!==this.accounts[x].telegramLogin){
            //     console.log("Corret login is: ", this.accounts[x].telegramLogin);
            //     return {
            //         isLoginNew: false,
            //         isTelegramLoginCorrect: false,
            //         room: null
            //     };
            // }
            if (!this.accounts[x].telegramLogin && user.telegramConnection){
                this.accounts[x].telegramLogin = user.telegramLogin;
                // console.log(user.telegramConnection);
                this.accounts[x].telegramConnection = user.telegramConnection;
            }
        }

        return {
            isLoginNew: false,
            isTelegramLoginCorrect: true,
            room: this.accounts[x].room ? chatController.getRoomById(this.accounts[x].room).chatroom : null
        };

    }
    getRoom(roomObj, userObj=null){
        if (!userObj) return chatController.getRoom(roomObj);

        const user = this.getUser(userObj);
        const room = chatController.getRoom(roomObj);
        console.log(user);
        console.log(room);
        if (room.id === user.room) return room;
            else return null;
    }
    getRooms(){
        return chatController.getRooms();
    }
    getUser(obj){
        if (obj.login) return this.accounts[this.accounts.findIndex(user => user.login===obj.login)];
        if (obj.telegramLogin) return this.accounts[this.accounts.findIndex(user => user.telegramLogin===obj.telegramLogin)];
        if (obj.room) return this.accounts.filter(user => user.room===obj.room);
        // if (obj.wsConnection) return this.accounts.filter(user => user.wsConnection===obj.wsConnection);
    }
    createRoom(user, name){
        return ChatController.createRoom(user, name);
    }
    joinRoom(login, roomName){
        let user = this.getUser({login: login});
        if (user.room) throw Error("You must leave your current room.");
        const room = chatController.joinRoom(login, roomName);
        if (room){
            user.room = room.id;
            return room;
        } else return null;
    }
    leaveRoom(login, _roomName=null){
        let user = this.getUser({login: login});
        console.log(login, _roomName);
        if (!user.room) throw Error("You aren't in room.");
        const roomName = _roomName ? _roomName : chatController.getRoom({id: user.room}).chatroom.name;
        console.log("Name of room is ", roomName);
        const room = chatController.leaveRoom(login, roomName);
        if (room){
            user.room = null;
            return room;
        } else return null;
    }
    renameRoom(login, names){
        chatController.renameRoom(login, names);
        return names;
    }
    removeRoom(login, roomName){
        const room = chatController.removeRoom(login, roomName);
        this.accounts.forEach(user=>{
            if (user.room === room.id) user.room = null;
        });
        return room;
    }
    postMessage(login, text){
        const roomId = this.getUser({login: login}).room;
        if (!roomId) throw Error("Not in room");
        return chatController.postMessage(login, roomId, text);
    }
    checkRpc(login){
        let user = this.getUser({login: login});
        const updates = user.rpcConnection;
        user.rpcConnection = [];
        return updates;
    }
    clearWS(connection){
        this.accounts=this.accounts.filter(user => user.wsConnection!==connection);
    }
    notifyMany(msg, arr=null){
        const cond = arr ? (item)=>{
            if (arr.indexOf(item)!==-1) return true;
            else return false;
        } : ()=>true;
        this.accounts.forEach(element => {
            if (cond(element.login)) {
                this.notify(msg, element);
                // console.log(`User ${element.login} is notified`);
            }
        });
    }
    notify(msg, _user){
        let user;
        if (!_user.login){
            x = this.accounts.findIndex(user => user.login === _user);
            user = this.accounts[x];
        } else user = _user;

        console.log({
            telLog: user.telegramLogin,
            telCon : user.telegramConnection,
            isWS: user.wsConnection ? true : false,
            isRPC: user.rpcConnection ? true : false
        });
        if (user.wsConnection) {
            console.log("try to send WS");
            this.wsSend(user.wsConnection, msg);
        }
        if (user.rpcConnection) {
            console.log("try to send RPC");
            this.rpcSend(user.rpcConnection, msg);
        }
        if (user.telegramConnection){
            console.log("try to send Teleram");
            this.telegramSend(user.telegramConnection, msg);
        }
    }
}
let x = new AccountsController();
module.exports = x;