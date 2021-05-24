require('dotenv').config();
module.exports = {
    url: process.env.mongo_url,
    port: process.env.PORT || 4444,
    jwtSecret: process.env.jwtSecret,
}
