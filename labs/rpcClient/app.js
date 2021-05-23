const { Console } = require('console');
const jayson = require('jayson/promise');
const port = 9090
const client = jayson.client.http('http://127.0.0.1:'+port);

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const MessageTypes = require('./messageTypes');

class AppMessage{
    constructor(payload){
        this.token = token;
        this.payload = payload;
    }
}

let timerId = null;
let current_room = null;
let token = null;

function errorHanding(err){
    console.log(err.message);
    if (timerId){
        clearTimeout(timerId);
        console.log("You are logged out.");
    }
    timerId=null;
    token=null;
    current_room=null;
}

function perform(line){
    if (line.charAt(0)!=='/'){
        if (!current_room || line==='') return;
        const responseProm = client.request('post-message', new AppMessage(line), null);
    }
    else{
        const match = line.split(' ');
        switch (match[0]){
            case '/login':{
                const responseProm = client.request('login', new AppMessage({
                    login: match[1],
                    telegramLogin: match[2]
                }));
                responseProm
                    .then(response=>{
                        if (!response.error){
                            const msg = response.result;
                            if (msg.type === MessageTypes.SERVER_TOKEN){
                                console.log("You are authorized");
                                token = msg.payload;
                                timerId = setInterval(update, 3000);
                            }
                        }
                    })
                    .catch(errorHanding);
                break;
            }
            case '/rooms':{
                const responseProm = client.request('get-rooms', new AppMessage({}));
                responseProm
                    .then(response=>{
                        const msg = response.result;
                        if (msg.type === MessageTypes.SERVER_ROOMS_LIST){
                            console.log(msg.payload);
                        }
                    })
                    .catch(errorHanding);
                break;
            }
            case '/rename':{
                const responseProm = client.request('rename-room', new AppMessage({
                    oldRoomName: match[1],
                    newRoomName: match[2]
                }), null);
                responseProm.catch(errorHanding);
                break;
            }
            case '/remove':{
                const responseProm = client.request('remove-room', new AppMessage(match[1]), null);
                responseProm.catch(errorHanding);
                break;
            }
            case '/create':{
                const responseProm = client.request('create-room', new AppMessage(match[1]), null);
                responseProm.catch(errorHanding);
                break;
            }
            case '/join':{
                const responseProm = client.request('join-room', new AppMessage(match[1]), null);
                responseProm.catch(errorHanding);
                break;
            }
            case '/leave':{
                if (!current_room) return;
                const responseProm = client.request('leave-room', new AppMessage(match[1]), null);
                responseProm.catch(errorHanding);
                break;
            }
            case '/members':{
                if (!current_room) return;
                const responseProm = client.request('get-members', new AppMessage(current_room.name));
                responseProm
                    .then(response=>{
                        const msg = response.result;
                        if (msg.type === MessageTypes.SERVER_MEMBERS_LIST){
                            console.log(msg.payload);
                        }
                    })
                    .catch(errorHanding);
                break;
            }
            case '/messages':{
                if (!current_room) return;
                const responseProm = client.request('get-messages', new AppMessage({}));
                responseProm
                    .then(response=>{
                        const msg = response.result;
                        if (msg.type === MessageTypes.SERVER_LAST_MESSAGES_LIST){
                            console.log(msg.payload);
                        }
                    })
                    .catch(errorHanding);
                break;
            }
        }
    }
}

function update(){
    const responseProm = client.request('check-updates', new AppMessage());
    responseProm
        .then(response=>{
            //console.log(response);
            if (response.result){
                const updates = response.result;
                updates.forEach(msg => {
                    switch (msg.type){
                        case MessageTypes.SERVER_ROOM_CREATED:{
                            console.log(`Room \`${msg.payload.name}\` was created`);
                            break;
                        }
                        case MessageTypes.SERVER_CURRENT_ROOM_CHANGED:{
                            current_room = msg.payload
                            if (current_room) console.log(`You are in \`${msg.payload.name}\``);
                                else console.log(`You are not in room`);
                            break;
                        }
                        case MessageTypes.SERVER_ROOM_REMOVED: {
                            console.log(`Room \`${msg.payload.name}\` was removed`);
                            break;
                        }
                        case MessageTypes.SERVER_ROOM_RENAMED: {
                            console.log(`Room \`${msg.payload.oldRoomName}\` was renamed to \`${msg.payload.newRoomName}\``);
                            break;
                        }
                        case MessageTypes.SERVER_MEMBER_JOINED: {
                            console.log(`\`${msg.payload}\` joined`);
                            break;
                        }
                        case MessageTypes.SERVER_MEMBER_LEFT: {
                            console.log(`\`${msg.payload}\` left`);
                            break;
                        }
                        case MessageTypes.SERVER_MESSAGE_POSTED: {
                            console.log(`${msg.payload.author}: ${msg.payload.text}`);
                            break;
                        }
                    }
                });
            }
        })
        .catch(err=>{
            console.log(`error:`, err);
        });
}

rl.on('line', perform);