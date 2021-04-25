const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const WsServer = require('./ChatServer');
const wsPort = require('./config').wsPort;


const app = express();
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
const server = http.createServer(app);
const wsServer = new WsServer(server);

app.get('/', (req, res) => res.sendFile('chat.html', {root: path.join(__dirname, "views")}));

server.listen(wsPort, () => console.log(`Web server started at ${wsPort}`));

/*=========================================================================================*/

const BOT_TOKEN = require('./config').botToken;
const TelegramBot = require('node-telegram-bot-api');
const BotChat = require('./BotChatServer');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(BOT_TOKEN, {polling: true});
const botChat = new BotChat(bot);

/*=========================================================================================*/

const jayson = require('jayson/promise');
const port = require('./config').rpcPort;
const rpsFunctions = require('./rpsChatServer');
// create a server
const rpcServer = jayson.server(rpsFunctions);
 
rpcServer.http('/rpc').listen(port);



/*=========================================================================================*/