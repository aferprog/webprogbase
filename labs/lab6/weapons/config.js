require('dotenv').config();
module.exports = {
    url: process.env.mongo_url,
    port: process.env.PORT || 3002,
    jwtSecret: process.env.jwtSecret,
    rabbitmq: process.env.rabbitmq
}