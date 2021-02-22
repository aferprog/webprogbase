// const env = process.env.NODE_ENV; // 'dev' or 'test'
require('dotenv').config();
const dev = {
 app: {
   port: process.env.DEV_APP_PORT || 3000
 },
 db: {
   key: process.env.DEV_DB_KEY || 'mongodb',
   host: process.env.DEV_DB_HOST || 'localhost',
   port: process.env.DEV_DB_PORT || 27017,
   name: process.env.DEV_DB_NAME || 'sample'
 }
};
const test = {
 app: {
   port: process.env.TEST_APP_PORT || 3000
 },
 db: {
   key: process.env.TEST_DB_KEY || 'mongodb',
   host: process.env.TEST_DB_HOST || 'localhost',
   port: process.env.TEST_DB_PORT || 27017,
   name: process.env.TEST_DB_NAME || 'sample'
 }
};
 const cloudinary={
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
 }
const config = {
 dev,
 test,
 cloudinary
};
 
module.exports = config;