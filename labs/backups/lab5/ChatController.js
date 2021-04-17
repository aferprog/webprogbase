let currentChatId = 0;
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
    getToken(info){
        return jwt.sign(info, jwtSecret);
    }
    getRooms(){
        return this.rooms.map(item => item.chatroom);
    }
    createRoom(user, name){
        const chatroom = new ChatRoom(user, name);
        if (this.findRoomByName(name)>=0) throw new Error("Already exist");
        this.rooms.push(new Room(chatroom));
        return chatroom;
    }
    joinRoom(user, room){
        let x = this.findRoomByUser(user);
        if (x>=0) {
            return {
                chatroom: this.rooms[x].chatroom,
                multiclient: true
            }
        }
        x = this.findRoomByName(room);
        const f = this.rooms[x].members.indexOf(user)>=0;
        if (!f) this.rooms[x].members.push(user);

        return {
            roomId: this.rooms[x].id,
            chatroom: this.rooms[x].chatroom,
            multiclient: f
        }
    }
    getMembers(room){
        const x = this.findRoomByName(room);
        return this.rooms[x].members;
    }
    leaveRoomByUser(user){
        const x = this.findRoomByUser(user);
        this.rooms[x].members = this.rooms[x].members.filter(item => item!==user);
        return this.rooms[x].members;
    }
    leaveRoom(user, room){
        const x = this.findRoomByName(room);
        this.rooms[x].members = this.rooms[x].members.filter(item => item!==user);
    }
    removeRoom(user, room){
        const x = this.findRoomByName(room);
        
        if (this.rooms[x].chatroom.owner!==user) throw new Error("No rule");

        const r = this.rooms.splice(x,1);
        return r[0];

    }
    renameRoom(user, room){
        if (this.findRoomByName(room.newRoomName)>=0) throw new Error("Already exist");

        const x = this.findRoomByName(room.oldRoomName);
        if (x===-1 || this.rooms[x].chatroom.owner!==user) throw new Error("No rule");

        this.rooms[x].chatroom.name=room.newRoomName;
        return room;
    }
    postMessage(user, text){
        const x = this.findRoomByUser(user);
        if (x<0) throw new Error("Not in chat");
        const room = this.rooms[x];
        const sms = new ChatMessage(user, text);
        room.messages.push(sms);
        return {
            members: room.members,
            message: sms
        }
    }
    findRoomByUser(user){
        const x = this.rooms.findIndex((room)=>{
            const members = room.members;
            if (members.indexOf(user)>=0) return true;
                else return false;
        });
        return x;
    }
    findRoomByName(name){
        const x = this.rooms.findIndex((item) => {
            return item.chatroom.name===name;
        });
        return x;
    }
    getRoomById(id){
        const x = this.rooms.findIndex((item) => {
            return item.id===id;
        });
        return this.rooms[x].chatroom.name;
    }
    lastMessages(room){
        const x = this.findRoomByName(room);
        if (x===-1) throw new Error("No such room");
        return this.rooms[x].messages.slice(-10);
    }
}


module.exports = new ChatController();