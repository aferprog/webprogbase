let currentChatId = 1;
class Room{
    constructor(chatroom, members=[], messages=[]){
        this.id = currentChatId++;
        this.chatroom = chatroom;
        this.members = members;
        this.messages = messages;
    }
}

class ChatRoom {
    constructor(owner, name) {
        this.owner = owner;
        this.name = name;
    }
}

class ChatMessage {
    constructor(author, text) {
        this.timestamp = Date.now();
        this.author = author;
        this.text = text;
    }
}

class ChatController{
    constructor(){
        this.rooms = [];
        this.users = [];
    }
    getRooms(){
        //return this.rooms.map(item => item.chatroom);
        return this.rooms;
    }
    createRoom(user, name){
        const x = this.rooms.findIndex((item) => {
            return item.chatroom.name===name;
        });
        if (x>=0) throw new Error("Already exist");
        const chatroom = new ChatRoom(user, name);
        this.rooms.push(new Room(chatroom));
        return chatroom;
    }
    joinRoom(user, roomName){
        // const room = this.getRoom({id: curRoomId});
        let room = this.getRoom({name: roomName});
        if (room){
            room.members.push(user);
            return room;
        } else return null;
    }
    leaveRoom(user, roomName){
        // const room = this.getRoom({id: curRoomId});
        
        let room = this.getRoom({name: roomName});
        if (room){
            room.members.splice(room.members.indexOf(user), 1);
            return room;
        } else return null;
    }
    getRoom(obj){
        if (obj.id) return this.rooms[this.rooms.findIndex(room => room.id===obj.id)];
        if (obj.name) return this.rooms[this.rooms.findIndex(room => room.chatroom.name===obj.name)];
    }
    renameRoom(user, names){
        const x = this.rooms.findIndex((item) => {
            return item.chatroom.name===names.newRoomName;
        });
        if (x>=0) throw new Error("Already exist");

        let room = this.getRoom({name: names.oldRoomName});
        if (!room || room.chatroom.owner!==user) throw new Error("No rule");

        room.chatroom.name=names.newRoomName;
        return names;
    }
    removeRoom(user, roomName){
        const x = this.rooms.findIndex((item) => {
            return item.chatroom.name===roomName;
        });
        if (x<0) throw new Error("No such room");
        if (this.rooms[x].chatroom.owner!==user) throw new Error("No rule");

        const r = this.rooms.splice(x,1);
        return r[0];
    }
    postMessage(user, roomId, text){
        let room = this.getRoom({id: roomId});
        if (!room) throw new Error("Incorrect room");
        const sms = new ChatMessage(user, text);
        room.messages.push(sms);
        return {
            members: room.members,
            message: sms
        }
    }
    getRoomById(id){
        const x = this.rooms.findIndex((item) => {
            return item.id===id;
        });
        return this.rooms[x];
    }
}


module.exports = new ChatController();