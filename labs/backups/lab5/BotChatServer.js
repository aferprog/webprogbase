let accountsController = require("./AccountsController");

class BotChat{
    constructor(bot){
        this.bot = bot;
        this.bot.onText(/\/login (.+)/, (msg, match)=>this.login(msg, match));
    }
    login(msg, match){
        const chatId = msg.chat.id;

        const user = {
            login: match[1],
            telegramLogin: msg.from.first_name,
            telegramConnection: {chatId: chatId}
        }
        const room = accountsController.editAccount(user);
        this.bot.sendMessage(chatId, `Okey. You are ${match[1]} since now.`);
    }
    getRooms(msg, math){
        
    }
    joinRoom(msg, math){

    }
    leaveRoom(msg, math){

    }
    renameRoom(msg, math){

    }
    removeRoom(msg, math){

    }
    getMembers(msg, math){

    }
    getMessages(msg, math){

    }
    postMessage(msg, math){
        
    }
}

module.exports = BotChat;