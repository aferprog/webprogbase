require('dotenv').config();
module.exports = {
    url: process.env.mongo_url,
    port: process.env.PORT || 4444,
    jwtSecret: process.env.jwtSecret,
    auth_url: process.env.auth_url,
    books_url: process.env.books_url,
    votes_url: process.env.votes_url,
    query_url: process.env.query_url
}
