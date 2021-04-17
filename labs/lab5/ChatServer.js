let accountsController = require("./AccountsController");
const MessageTypes = require('./messageTypes');

const jwt = require('jsonwebtoken');
const jwtSecret = require('./config').jwtSecret;

const WebSocketServer = require('ws').Server;

class AppMessage {
    constructor(token, type = "undefined", payload = null) {
        this.token = token;
        this.type = type;
        this.payload = payload;
    }
}
class User{
    constructor(connection, login=null){
        this.connection=connection;
        this.login=login;
    }
}
class ChatServer{

    constructor(server){
        this.connections = [];
        
        accountsController.wsSend = this.sendMessage;
        
        this.wsServer = new WebSocketServer({ server });
        this.wsServer.on("connection", connection => {
            this.addConnection(connection);
            console.log("(+) new connection. total connections:", this.connections.length);
            connection.on("message", message => this.perform(message, connection));
            connection.on("close", () => this.onClose(connection) );
          });
    }
   /* notifyMany(msg, cond = ()=>true){
        this.connections.forEach(element => {
            if (cond(element)) {
                this.sendMessage(element.connection, msg);
                console.log(`User ${element.login} is notified`);
            }
        });
    }*/
    addConnection(connection){
        this.connections.push(connection);
    }
    perform(message, connection){
        const msg = JSON.parse(message);
        console.log(msg.type);
        try{
            switch(msg.type){
                case MessageTypes.CLIENT_GET_TOKEN:{
                    const user = {
                        login: msg.payload.login,
                        telegramLogin: msg.payload.telegramLogin,
                        wsConnection: connection
                    }
                    const content = accountsController.addAccount(user);
                    console.log(content);
                    if (content.isLoginNew){
                            const token = jwt.sign(user.login, jwtSecret);
                            const appmsg = new AppMessage(token, MessageTypes.SERVER_TOKEN, token);
                            this.sendMessage(user.wsConnection, appmsg);
                    } else
                    if (!content.isTelegramLoginCorrect){
                        const appmsg = new AppMessage(null, "error", "Error: telegram login isn't correct");
                        this.sendMessage(user.wsConnection, appmsg);
                    } else{
                        this.connections.splice(this.connections.indexOf(connection), 1);
                        const token = jwt.sign(user.login, jwtSecret);
                        const appmsg = new AppMessage(token, MessageTypes.SERVER_TOKEN, token);
                        this.sendMessage(connection, appmsg);
                        if (content.room){
                            const appmsg = new AppMessage(token, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, content.room);
                            this.sendMessage(connection, appmsg);
                        }
                    }
                    break;
                }
                case MessageTypes.CLIENT_GET_ROOMS_LIST:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const rooms = accountsController.getRooms();
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOMS_LIST, rooms.map(room => room.chatroom));
                    this.sendMessage(connection, appmsg);
                    break;
                }
                case MessageTypes.CLIENT_CREATE_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const chatroom = accountsController.createRoom(user,msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_CREATED, chatroom);
                    accountsController.notifyMany(appmsg);
                    break;
                }
                case MessageTypes.CLIENT_JOIN_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const room = accountsController.joinRoom(user, msg.payload);
                    if (!room){
                        console.log("No such room");
                    }
                    let appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_JOINED, user);
                    accountsController.notifyMany(appmsg, room.members);
                    appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, room.chatroom);
                    accountsController.notify(appmsg, user);
                    break;
                }
                case MessageTypes.CLIENT_LEAVE_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const room = accountsController.leaveRoom(user, msg.payload);
                    let appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null);
                    accountsController.notify(appmsg, user);
                    appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_LEFT, user);
                    accountsController.notifyMany(appmsg, room.members);
                    break;
                }
                case MessageTypes.CLIENT_RENAME_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const content = accountsController.renameRoom(user,msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_RENAMED, content);
                    accountsController.notifyMany(appmsg);
                    break;
                }
                case MessageTypes.CLIENT_GET_MEMBERS_LIST:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const room = accountsController.getRoom({name: msg.payload});
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBERS_LIST, room.members);
                    this.sendMessage(connection, appmsg);
                    break;
                }
                case MessageTypes.CLIENT_REMOVE_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const room = accountsController.removeRoom(user,msg.payload);
                    let appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_REMOVED, room.chatroom);
                    accountsController.notifyMany(appmsg);
                    appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null);
                    accountsController.notifyMany(appmsg, room.members);
                    break;
                }
                case MessageTypes.CLIENT_POST_MESSAGE:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const whatAndTo = accountsController.postMessage(user, msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_MESSAGE_POSTED, whatAndTo.message);
                    accountsController.notifyMany(appmsg, whatAndTo.members);
                    break;
                }
                case MessageTypes.CLIENT_GET_LAST_MESSAGES_LIST:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const room = accountsController.getRoom({name: msg.payload}, {login: user});
                    if (!room) throw Error("You are not in this room.");
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_LAST_MESSAGES_LIST, room.messages);
                    this.sendMessage(connection, appmsg);
                    break;
                }
            }
        }
        catch(err){
            console.log(err.message);
            const appmsg = new AppMessage(null, "error", err.message);
            this.sendMessage(connection, appmsg);
        }
    }
    onClose(connection){

        this.connections.splice(this.connections.indexOf(connection), 1);
        accountsController.clearWS(connection);
        // if (this.connections.length==0 || t>=0) return;
/*
        const user = accountsController.delWsConnection(connection);
        console.log(user);
        if (user){
            const members = chatController.leaveRoomByUser(user);
            const appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_LEFT, user);
            accountsController.notifyMany(appmsg, members);
        }*/

    }
    sendMessage(connection, msg){
        connection.send(JSON.stringify(msg));
        // console.log(msg);
    }
    checkFunc(arr){
        return (item)=>{
            if (arr.indexOf(item.login)!==-1) return true;
            else return false;
        }
    }
}

module.exports = ChatServer;