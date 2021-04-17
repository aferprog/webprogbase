require('dotenv').config();

module.exports = {
    wsPort: process.env.PORT || process.env.WS_PORT,
    rpcPort: process.env.PORT || process.env.RPC_PORT,
    botToken: process.env.BOT_TOKEN,
    jwtSecret: process.env.JWT_SEKRET
}