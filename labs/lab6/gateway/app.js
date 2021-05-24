const fs = require('fs');
const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('graphql-tools');
const config = require('./config');
const path = require('path');
const fetch = require('node-fetch');
port = config.port;
// const { GraphQLDateTime } = require('graphql-iso-date');

async function makeGETRequest(url) {
    const rawresponse = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const content = await rawresponse;
    return content;
}

async function makePUTRequest(url , data)
{
    const rawresponse = await fetch(url, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    });
    const content = await rawresponse;
    return content;
}

async function makePOSTRequest(url , data)
{
    const rawresponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    });
    const content = await rawresponse;
    return content;
    
}

const typeDefs = fs.readFileSync('./schema.gql').toString();

const resolvers = {
    Query: {
        usernameExists: async (_, { login }) => {
            const url = config.auth_url + '/usernameExists?' + new URLSearchParams({
                login: login,
            }).toString();
            console.log(url);
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        users: async () => {
            const url = config.auth_url + '/users';
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        usersById: async (_, { userId }) => {
            const url = config.auth_url + '/users/' + userId;
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        me: async (_, { }, context) => {
            const url = config.auth_url + '/me?' + new URLSearchParams({
                token: context.user.token
            });
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        getWeapons: async (_, { page, size }) => {
            const url = config.weapons_url + '/weapons?' + new URLSearchParams({
                page: page,
                size: size
            });
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        getWeaponById: async (_, { weaponId }) => {
            const url = config.weapons_url + '/weapons/' + weaponId;
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        getWeaponsVotes: async (_, {page , size} , context) => {
            const url = config.query_url + '/weapons/votes?' + new URLSearchParams({
                page: page,
                size: size
            });
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        getWeaponsByIdVotes: async (_, {weaponId} , context) => {
            const url = config.query_url + '/weapons/' + weaponId + '/votes';
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        getUserByIdVotes: async (_ , {userId , page , size} , context) => {
            const url = config.query_url + '/user/' + userId + '/votes?' + new URLSearchParams({
                page: page,
                size: size
            });
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        getMeVotes: async (_, {page , size} , context) => {
            const url = config.query_url + '/me/votes?' + new URLSearchParams({
                token: context.user.token,
                page: page,
                size: size
            });
            const content = await makeGETRequest(url);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        }
    },
    Mutation: {
        register: async (_, { login, password }) => {
            const url = config.auth_url + '/register';
            const content = await makePOSTRequest(url , JSON.stringify({ login: login, password: password }));
            if (content.status != 201) {
                throw new Error(content.status);
            } else {
                return content.json();
            }
        },
        login: async (_, { login, password }, context) => {
            const url = config.auth_url + '/login';
            const content = await makePOSTRequest(url , JSON.stringify({ login: login, password: password }));
            if (content.status != 201) {
                throw new Error(content.status);
            } else {
                var res = await content.json();
                context.user = res;
                return res;
            }
        },
        addWeapon: async (_, { name, speed, damage }, context) => {
            const url = config.weapons_url + '/weapons'
            const data = JSON.stringify({
                token: context.user.token,
                name: name,
                speed: speed,
                damage: damage
            });
            const content = await makePOSTRequest(url , data);
            if (content.status != 201) {
                throw new Error(content.status);
            } else {
                var res = await content.json();
                return res;
            }
        },
        updateWeapon: async (_, {_id , name , speed , damage}, context) => {
            const url = config.weapons_url + '/weapons';
            const data = JSON.stringify({
                token: context.user.token,
                _id: _id,
                name: name,
                speed: speed,
                damage: damage
            });
            const content = await makePUTRequest(url , data);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                var res = await content.json();
                return res;
            }
        },
        deleteWeapon: async (_, {_id} , context) => {
            const url = config.weapons_url + '/delete';
            const data = JSON.stringify({
                token: context.user.token,
                _id: _id
            });
            const content = await makePOSTRequest(url , data);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                var res = await content.json();
                return res;
            }
        },
        vote: async (_, {weapon_id} , context) => {
            const url = config.votes_url + '/vote';
            const data = JSON.stringify({
                token: context.user.token,
                weapon_id: weapon_id
            });
            const content = await makePOSTRequest(url , data);
            if (content.status != 201) {
                throw new Error(content.status);
            } else {
                var res = await content.json();
                return res;
            }
        },
        unvote: async (_, {weapon_id} , context) => {
            const url = config.votes_url + '/unvote';
            const data = JSON.stringify({
                token: context.user.token,
                weapon_id: weapon_id
            });
            const content = await makePOSTRequest(url , data);
            if (content.status != 200) {
                throw new Error(content.status);
            } else {
                var res = await content.json();
                return res;
            }
        }
    }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
    context: {},
}))

app.listen(port, err => {
    if (err) {
        return console.log("ERROR", err);
    }
    console.log('listening on port ' + port);
});