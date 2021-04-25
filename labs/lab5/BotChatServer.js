let accountsController = require("./AccountsController");
const MessageTypes = require('./messageTypes');


class AppMessage {
    constructor(token, type = "undefined", payload = null) {
        this.token = token;
        this.type = type;
        this.payload = payload;
    }
}

class BotChat{
    constructor(bot){
        this.bot = bot;
        accountsController.telegramSend = async function(connection, msg){
            const roomList = function (rooms){
                if (rooms.length===0) return "No rooms";
                let r = "";
                rooms.forEach((room, i) => {
                    r+=`${i+1}) ${room.chatroom.name}\n`;
                });
                return "<b>"+r+"</b>";
            }

            switch (msg.type){
                case MessageTypes.SERVER_ROOM_REMOVED: {
                    bot.sendMessage(connection.chatId, `<b>\`${msg.payload.name}\` was removed</b>`, { parse_mode: "HTML" });
                    if (!connection.roomsList) break;
                    const rooms = accountsController.getRooms();
                    const text = roomList(rooms);
                    bot.editMessageText(text, {
                        chat_id: connection.chatId, 
                        message_id: connection.roomsList
                    });
                    break;
                }
                case MessageTypes.SERVER_ROOM_RENAMED: {
                    bot.sendMessage(connection.chatId, `<b>\`${msg.payload.oldRoomName}\` renamed to \`${msg.payload.newRoomName}\`</b>`, { parse_mode: "HTML" });
                    if (!connection.roomsList) break;
                    const rooms = accountsController.getRooms();
                    const text = roomList(rooms);
                    bot.editMessageText(text, {
                        chat_id: connection.chatId, 
                        message_id: connection.roomsList,
                        parse_mode: "HTML"
                    });
                    break;
                }
                case MessageTypes.SERVER_ROOM_CREATED: {
                    if (!connection.roomsList) break;
                    const rooms = accountsController.getRooms();
                    const text = roomList(rooms);
                    bot.editMessageText(text, {
                        chat_id: connection.chatId, 
                        message_id: connection.roomsList,
                        parse_mode: "HTML"
                    });
                    break;
                }
                case MessageTypes.SERVER_CURRENT_ROOM_CHANGED:{
                    if (msg.payload){
                        bot.sendMessage(connection.chatId, `<b>Your current room is ${msg.payload.name}. Its owner is ${msg.payload.owner}.</b>`, { parse_mode: "HTML" });
                    }
                    else {
                        bot.sendMessage(connection.chatId, "<b>You are not in room</b>", { parse_mode: "HTML" });
                    }
                    break;
                }
                case MessageTypes.SERVER_MEMBER_JOINED:{
                     bot.sendMessage(connection.chatId, `<b>\`${msg.payload}\` has joined recently</b>`, { parse_mode: "HTML" });
                    break;
                }
                case MessageTypes.SERVER_MEMBER_LEFT:{
                    bot.sendMessage(connection.chatId, `<b>\`${msg.payload}\` has left recently</b>`, { parse_mode: "HTML" });
                   break;
               }
                case MessageTypes.SERVER_MESSAGE_POSTED: {
                    bot.sendMessage(connection.chatId, `<b>${msg.payload.author}: </b>${msg.payload.text}`, { parse_mode: "HTML" });
                    break;
                }
            }
        };


        this.bot.onText(/\/login (.+)/, (msg, match)=>this.login(msg, match));
        this.bot.onText(/\/rooms/, (msg, match)=>this.getRooms(msg));
        this.bot.onText(/\/create (.+)/, (msg, match)=>this.createRoom(msg, match));
        this.bot.onText(/\/join (.+)/, (msg, match)=>this.joinRoom(msg, match));
        this.bot.onText(/\/leave/, (msg, match)=>this.leaveRoom(msg));
        this.bot.onText(/\/members/, (msg, match)=>this.getMembers(msg, match));
        this.bot.onText(/\/messages/, (msg, match)=>this.getMessages(msg));
        this.bot.onText(/\/rename (.+) to (.+)/, (msg, match)=>this.renameRoom(msg, match));
        this.bot.onText(/\/remove (.+)/, (msg, match)=>this.removeRoom(msg, match));
        this.bot.onText(/(.+)/, (msg, match)=>this.postMessage(msg, match));
    }
    login(msg, match){
        try{
            console.log("TG login");
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, match[1]);
            const user = {
                login: match[1],
                telegramLogin: msg.from.first_name,
                telegramConnection: {chatId: chatId}
            }
            const content = accountsController.addAccount(user);
            if (content.isLoginNew){
                    this.bot.sendMessage(chatId, `Okey. You are \`${match[1]}\` since now.`);
                    return;
            } else
            if (!content.isTelegramLoginCorrect){
                this.bot.sendMessage(chatId, `\`${user.login}\` is already connected with enother telegram.`);
                return;
            } else{
                this.bot.sendMessage(chatId, `Okey. You are ${match[1]} since now.`);
                if (content.room){
                    this.bot.sendMessage(chatId, `You are in \`${content.room.name}\``);
                }
            }
        } catch (err){
            console.log(err.message);
            this.bot.sendMessage(msg.chat.id, `<b>-- Denied --</b>`, { parse_mode: "HTML" } );
        }
        
    }
    async getRooms(msg){
        try{
            console.log("TG get-room");
            const rooms = accountsController.getRooms();
            const text = this.roomList(rooms);
            const roomsListId = (await this.bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" }) ).message_id;
            try{
                let user = accountsController.getUser({telegramLogin: msg.from.first_name});
                user.telegramConnection.roomsList = roomsListId;
            }
            catch(err){
                console.log(`|| Line 42: ${err.message}`);
                console.log(`|| User's telegram isn't registred`);
            }
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- Now it is impossible --</b>`, { parse_mode: "HTML" } );
        }
    }
    createRoom(msg, math){
        try{
            console.log("TG create-room");
            const user = accountsController.getUser({telegramLogin: msg.from.first_name}).login;
            const chatroom = accountsController.createRoom(user,math[1]);
            const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_CREATED, chatroom);
            accountsController.notifyMany(appmsg);
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- ${err.message} --</b>`, { parse_mode: "HTML" } );
        }
    }

    joinRoom(msg, match){
        try{
            console.log("TG join-room");
            const user = accountsController.getUser({telegramLogin: msg.from.first_name}).login;
            const room = accountsController.joinRoom(user, match[1]);
            let appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_JOINED, user);
            accountsController.notifyMany(appmsg, room.members);
            appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, room.chatroom);
            accountsController.notify(appmsg, user);
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- You are already in room or such room doesn't exist --</b>`, { parse_mode: "HTML" } );
        }
    }
    leaveRoom(msg){
        try{
            console.log("TG leave-room");
            const user = accountsController.getUser({telegramLogin: msg.from.first_name}).login;
            const room = accountsController.leaveRoom(user);
            let appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null);
            accountsController.notify(appmsg, user);
            appmsg = new AppMessage(null, MessageTypes.SERVER_MEMBER_LEFT, user);
            accountsController.notifyMany(appmsg, room.members);
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- You are already not in room --</b>`, { parse_mode: "HTML" } );
        }
    }
    renameRoom(msg, match){
        try{
            console.log("TG rename: ", match);
            const user = accountsController.getUser({telegramLogin: msg.from.first_name}).login;
            const names = {
                oldRoomName: match[1],
                newRoomName: match[2]
            }
            const content = accountsController.renameRoom(user,names);
            const appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_RENAMED, content);
            accountsController.notifyMany(appmsg);
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- Error. Maybe such room already exists --</b>`, { parse_mode: "HTML" } );
        }
    }
    removeRoom(msg, match){
        try{
            console.log("TG removing: ", match[1]);
            const user = accountsController.getUser({telegramLogin: msg.from.first_name}).login;

            const room = accountsController.removeRoom(user, match[1]);
            let appmsg = new AppMessage(null, MessageTypes.SERVER_ROOM_REMOVED, room.chatroom);
            accountsController.notifyMany(appmsg);
            appmsg = new AppMessage(null, MessageTypes.SERVER_CURRENT_ROOM_CHANGED, null);
            accountsController.notifyMany(appmsg, room.members);
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- Denied --</b>`, { parse_mode: "HTML" } );
        }
    }
    async getMembers(msg, match){
        try{
            console.log("TG get-members");
            const roomId = accountsController.getUser({telegramLogin: msg.from.first_name}).room;
            const room = accountsController.getRoom({id: roomId});
            const membersListId = (await this.bot.sendMessage(msg.chat.id, this.membersList(room.members), { parse_mode: "HTML" } )).message_id;
            try{
                let user = accountsController.getUser({telegramLogin: msg.from.first_name});
                user.telegramConnection.membersListId = membersListId;
            }
            catch(err){
                console.log(`|| Line 42: ${err.message}`);
                console.log(`|| User's telegram isn't registred`);
            }
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- Denied --</b>`, { parse_mode: "HTML" } );
        }
    }
    getMessages(msg){
        try{
            console.log("TG get-messages");
            const user = accountsController.getUser({telegramLogin: msg.from.first_name});
            const room = accountsController.getRoom({id: user.room});
            console.log(room);
            if (!room) throw new Error("You are not in this room.");
            this.bot.sendMessage(msg.chat.id, this.messagesList(room.messages), { parse_mode: "HTML" } );
        } catch (err){
            this.bot.sendMessage(msg.chat.id, `<b>-- Denied --</b>`, { parse_mode: "HTML" } );
        }
    }
    postMessage(msg, match){
        console.log("TG post-message");
        if (match[0].charAt(0)!=='/'){
            console.log("Posting msg");
            try{
                const userT = accountsController.getUser({telegramLogin: msg.from.first_name});
                if (!userT) throw new Error("Your telegram isn't registered");
                const user = userT.login;
                const whatAndTo = accountsController.postMessage(user, match[0]);
                const appmsg = new AppMessage(null, MessageTypes.SERVER_MESSAGE_POSTED, whatAndTo.message);
                accountsController.notifyMany(appmsg, whatAndTo.members);
            } catch (err){
                this.bot.sendMessage(msg.chat.id, `<b>-- Denied --</b>`, { parse_mode: "HTML" } );
            }
        }
    }
    roomList(rooms){
        if (rooms.length===0) return "No rooms";
        let r = "";
        rooms.forEach((room, i) => {
            r+=`${i+1}) ${room.chatroom.name}\n`;
        });
        return "<b>"+r+"</b>";
    }
    membersList(members){
        if (members.length===0) return "No members";
        let r = "";
        members.forEach((login, i) => {
            r+=`${i+1}) ${login}\n`;
        });
        return "<b>"+r+"</b>";
    }
    messagesList(messages){
        if (messages.length===0) return "No messages";
        let r = "";
        messages.forEach((msg) => {
            r+=`<b>${msg.author}:</b> ${msg.text}\n`;
        });
        return r;
    }
}

module.exports = BotChat;