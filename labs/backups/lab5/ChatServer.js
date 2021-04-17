let accountsController = require("./AccountsController");

const WebSocketServer = require('ws').Server;
const chatController = require('./ChatController');
const jwt = require('jsonwebtoken');
const jwtSecret = require('./config').jwtSecret;

class AppMessage {
    constructor(token, type = "undefined", payload = null) {
        this.token = token;
        this.type = type;
        this.payload = payload;
    }
}

const MessageTypes = {
    CLIENT_GET_TOKEN: "get-token",
    CLIENT_GET_ROOMS_LIST: "get-rooms-list",
    CLIENT_CREATE_ROOM: "create-room",
    CLIENT_RENAME_ROOM: "rename-room",
    CLIENT_REMOVE_ROOM: "remove-room",
    CLIENT_JOIN_ROOM: "join-room",
    CLIENT_LEAVE_ROOM: "leave-room",
    CLIENT_GET_LAST_MESSAGES_LIST: "get-last-messages-list",
    CLIENT_GET_MEMBERS_LIST: "get-members-list",
    CLIENT_POST_MESSAGE: "post-message",
    //
    SERVER_TOKEN: "token",
    SERVER_ROOMS_LIST: "rooms-list",
    SERVER_ROOM_CREATED: "room-created",
    SERVER_ROOM_RENAMED: "room-renamed",
    SERVER_ROOM_REMOVED: "room-removed",
    SERVER_CURRENT_ROOM_CHANGED: "current-room-changed",
    SERVER_MEMBER_JOINED: "member-joined",
    SERVER_MEMBER_LEFT: "member-left",
    SERVER_LAST_MESSAGES_LIST: "last-messages-list",
    SERVER_MEMBERS_LIST: "members-list",
    SERVER_MESSAGE_POSTED: "message-posted",
};

class User{
    constructor(connection, login=null){
        this.connection=connection;
        this.login=login;
    }
}
class ChatServer{

    constructor(server){
        this.connections = [];
        this.wsServer = new WebSocketServer({ server });

        this.wsServer.on("connection", connection => {
            this.addConnection(connection);
            console.log("(+) new connection. total connections:", this.connections.length);
            connection.on("message", message => this.perform(message, connection));
            connection.on("close", () => this.onClose(connection) );
          });
    }
    notifyMany(msg, cond = ()=>true){
        this.connections.forEach(element => {
            if (cond(element)) {
                this.sendMessage(element.connection, msg);
                console.log(`User ${element.login} is notified`);
            }
        });
    }
    addConnection(connection){
        this.connections.push(connection);
    }
    perform(message, connection){
        const msg = JSON.parse(message);
        console.log(msg.type);
       try{
            switch(msg.type){
                case MessageTypes.CLIENT_GET_TOKEN:{
                    const token = jwt.sign(msg.payload.login, jwtSecret);
                    const appmsg = new AppMessage(token, MessageTypes.SERVER_TOKEN, token);

                    const x = this.connections.indexOf(connection);
                    const con = this.connections.splice(x, 1)[0];
                    accountsController.editAccount({
                        login: msg.payload.login,
                        wsConnection: con
                    });
                    const roomId = accountsController.getRoom(msg.payload.login);
                    // console.log(roomId);
                    this.sendMessage(connection, appmsg);
                    if (roomId!=null){
                        const roomName = chatController.getRoomById(roomId);
                        // console.log(roomName);
                        const content = chatController.joinRoom(msg.payload.login, roomName);
                        let appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, content.chatroom);
                        this.sendMessage(con, appmsg);
                        appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_JOINED, msg.payload.login);
                        const members = chatController.getMembers(roomName);
                        accountsController.notifyMany(appmsg, members);
                    }
                    break;
                }
                case MessageTypes.CLIENT_GET_ROOMS_LIST:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const content = chatController.getRooms();
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOMS_LIST, content);
                    this.sendMessage(connection, appmsg);
                    break;
                }
                case MessageTypes.CLIENT_CREATE_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const content = chatController.createRoom(user,msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_CREATED, content);
                    accountsController.notifyMany(appmsg);
                    break;
                }
                case MessageTypes.CLIENT_RENAME_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const content = chatController.renameRoom(user,msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_RENAMED, content);
                    accountsController.notifyMany(appmsg);
                    break;
                }
                case MessageTypes.CLIENT_REMOVE_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    console.log(user);
                    const room = chatController.removeRoom(user,msg.payload);
                    
                    let appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_REMOVED, room.chatroom);
                    accountsController.notifyMany(appmsg);

                    appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null);
                    accountsController.delRoom(room.id);
                    accountsController.notifyMany(appmsg, room.members);

                    break;
                }
                case MessageTypes.CLIENT_JOIN_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const content = chatController.joinRoom(user, msg.payload);
                    accountsController.setRoom(user, content.roomId);
                    let appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, content.chatroom);
                    accountsController.notify(appmsg, user);
                    
                    const members = chatController.getMembers(msg.payload);
                    appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_JOINED, user);
                    accountsController.notifyMany(appmsg, members);
                    break;
                }
                case MessageTypes.CLIENT_GET_MEMBERS_LIST:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    console.log(user);
                    const content = chatController.getMembers(msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBERS_LIST, content);
                    this.sendMessage(connection, appmsg);
                    break;
                }
                case MessageTypes.CLIENT_LEAVE_ROOM:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    console.log(user);
                    chatController.leaveRoom(user, msg.payload);
                    accountsController.setRoom(user, null);
                    accountsController.notify(new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null), user);
                    // this.sendMessage(connection, new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null));


                    const members = chatController.getMembers(msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_LEFT, user);
                    accountsController.notifyMany(appmsg, members);
                    break;
                }
                case MessageTypes.CLIENT_POST_MESSAGE:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const content = chatController.postMessage(user, msg.payload);
                    const members = content.members;
                    const sms = content.message;
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_MESSAGE_POSTED, sms);
                    accountsController.notifyMany(appmsg, members);
                    break;
                }
                case MessageTypes.CLIENT_GET_LAST_MESSAGES_LIST:{
                    const user = jwt.verify(msg.token, jwtSecret);
                    const content = chatController.lastMessages(msg.payload);
                    const appmsg = new AppMessage(null, MessageTypes.SERVER_LAST_MESSAGES_LIST, content);
                    this.sendMessage(connection, appmsg);
                    break;
                }
            }
        }
        catch(err){
            console.log(err.message);
        }
    }
    onClose(connection){
        this.connections.splice(this.connections.indexOf(connection), 1)[0];
        console.log("(-) connection lost. total connections:", this.connections.length);
        // if (this.connections.length==0 || t>=0) return;

        const user = accountsController.delWsConnection(connection);
        console.log(user);
        if (user){
            const members = chatController.leaveRoomByUser(user);
            const appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_LEFT, user);
            accountsController.notifyMany(appmsg, members);
        }

    }
    sendMessage(connection, msg){
        connection.send(JSON.stringify(msg));
        console.log(msg);
    }
    checkFunc(arr){
        return (item)=>{
            if (arr.indexOf(item.login)!==-1) return true;
            else return false;
        }
    }
}

module.exports = ChatServer;