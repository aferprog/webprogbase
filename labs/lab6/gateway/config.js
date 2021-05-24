require('dotenv').config();
module.exports = {
    port: process.env.PORT || 3000,
    auth_url: process.env.auth_url,
    weapons_url: process.env.weapons_url,
    votes_url: process.env.votes_url,
    query_url: process.env.query_url
}
