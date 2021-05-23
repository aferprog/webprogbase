let accountsController = require("./AccountsController");
accountsController.rpcSend = function (updates, msg){
    updates.push(msg);
}

const MessageTypes = require('./messageTypes');

const jwt = require('jsonwebtoken');
const jwtSecret = require('./config').jwtSecret;

class AppMessage {
    constructor(token, type = "undefined", payload = null) {
        this.token = token;
        this.type = type;
        this.payload = payload;
    }
}

module.exports = {
    'login': function (msg, callback){
        console.log("rpc-login");

        const user = {
            login: msg.payload.login,
            telegramLogin: msg.payload.telegramLogin,
            rpcConnection: []
        }
        let content={};
        try{
            content = accountsController.addAccount(user);
        } catch(err){
            callback(null, 'uuuu');
            return;
        }
        console.log(content);
        if (content.isLoginNew){
                const token = jwt.sign(user.login, jwtSecret);
                const appmsg = new AppMessage(token, MessageTypes.SERVER_TOKEN, token);
                callback(null, appmsg);
        } else
        if (!content.isTelegramLoginCorrect){
            const appmsg = new AppMessage(null, "error", "Error: telegram login isn't correct");
            callback('error', appmsg);
        } else{
            const token = jwt.sign(user.login, jwtSecret);
            const appmsg = new AppMessage(token, MessageTypes.SERVER_TOKEN, token);
            callback(null, appmsg);
            if (content.room){
                let _user = accountsController.getUser({login: user.login});
                const appmsg = new AppMessage(token, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, content.room);
                _user.rpcConnection.push(appmsg);
            }
        }

    },
    'get-rooms': function (msg, callback){
        console.log("rpc-get-rooms");
        try{
            const user = jwt.verify(msg.token, jwtSecret);
        }
        catch(err){
            callback('Bad token', null);
        }
            const rooms = accountsController.getRooms();
            const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOMS_LIST, rooms.map(room => room.chatroom));
            callback(null, appmsg);
    },
    'create-room': function (msg, callback){
        console.log("rpc-create-room");
        try{
            const user = jwt.verify(msg.token, jwtSecret);
            const chatroom = accountsController.createRoom(user,msg.payload);
            const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_CREATED, chatroom);
            accountsController.notifyMany(appmsg);
        } catch(err){
            callback("err", null);
        }
    },
    'join-room': function (msg, callback){
        console.log("rpc-join-room");
        try{
            const user = jwt.verify(msg.token, jwtSecret);
            console.log();
            const room = accountsController.joinRoom(user, msg.payload);
            if (!room){
                console.log("No such room");
            }
            let appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_JOINED, user);
            accountsController.notifyMany(appmsg, room.members);
            appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, room.chatroom);
            accountsController.notify(appmsg, user);
        } catch(err){
            callback("err", null);
        }
    },
    'leave-room': function (msg, callback){
        try{
            console.log("rpc-leave-room");
            const user = jwt.verify(msg.token, jwtSecret);
            const room = accountsController.leaveRoom(user, msg.payload);
            let appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null);
            accountsController.notify(appmsg, user);
            appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_LEFT, user);
            accountsController.notifyMany(appmsg, room.members);
        } catch(err){
            callback("err", null);
        }
    },
    'remove-room': function (msg, callback){
        console.log("rpc-remove-room");
        try{
            const user = jwt.verify(msg.token, jwtSecret);
            const room = accountsController.removeRoom(user,msg.payload);
            let appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_REMOVED, room.chatroom);
            accountsController.notifyMany(appmsg);
            appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null);
            accountsController.notifyMany(appmsg, room.members);
        } catch(err){
            callback("err", null);
        }
    },
    'rename-room': function (msg, callback){
        console.log("rpc-rename-room");
        try{
            const user = jwt.verify(msg.token, jwtSecret);
            const content = accountsController.renameRoom(user,msg.payload);
            const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_RENAMED, content);
            accountsController.notifyMany(appmsg);
        } catch(err){
            callback("err", null);
        }
    },
    'get-members': function (msg, callback){
        console.log("rpc-get-members");
        const user = jwt.verify(msg.token, jwtSecret);
        try{
            const room = accountsController.getRoom({name: msg.payload});
            const appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBERS_LIST, room.members);
            callback(null, appmsg);
        } catch (err){
            console.log(err.message);
        }
    },
    'get-messages': function (msg, callback){
        try{
            const user = jwt.verify(msg.token, jwtSecret);
            const room = accountsController.getRoom({name: msg.payload}, {login: user});
            if (!room) throw Error("You are not in this room.");
            const appmsg = new AppMessage(null, MessageTypes.SERVER_LAST_MESSAGES_LIST, room.messages);
            callback(null, appmsg);
        } catch(err){
            callback("err", null);
        }
    },
    'post-message': function (msg, callback){
        try{
            const user = jwt.verify(msg.token, jwtSecret);
            const whatAndTo = accountsController.postMessage(user, msg.payload);
            const appmsg = new AppMessage(null, MessageTypes.SERVER_MESSAGE_POSTED, whatAndTo.message);
            accountsController.notifyMany(appmsg, whatAndTo.members);
            callback(null, appmsg);
        } catch(err){
            callback("err", null);
        }
    },
    'check-updates': function (msg, callback){
        try{
            const user = jwt.verify(msg.token, jwtSecret);
            const updates = accountsController.checkRpc(user);
            callback(null, updates);
        } catch(err){
            callback("err", null);
        }
    }
}