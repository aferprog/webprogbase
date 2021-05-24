const jayson = require('jayson/promise');
const port = 3000;
const client = jayson.client.http('http://localhost:'+port);

// const readline = require('readline');
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGE5MTRhNzQ4MjA5ZTFkNTIwODdkZWEiLCJsb2dpbiI6InNvbWVvbmUxIiwiaWF0IjoxNjIxNzU3NjYyfQ.4jkuB3S-JuOUXHGSk6-8VQbcwjIfiZrDeEH8JhFtPhQ';
const responseProm = client.request('unvote', {
    token,
    'weapon': '60aa3ea238c3fd35b45341bd'
});
responseProm
    .then(response=>{
        const msg = response.result;
        console.log(msg);
    });

//rl.on('line', perform);