const express = require("express");
const {graphqlHTTP} = require("express-graphql");
const {buildSchema} = require("graphql");
const rabbit = require("rabbitmq");

const fs = require("fs");
const app = express();

const schema = buildSchema(fs.readFileSync('./schema.gql').toString());

const root = {
    hello: ()=>{
        return "Hello";
    }
}

const graphQlMiddle = graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
});

app.get("/", (req, res)=>{
    res.send("I'm okey");
});
app.use("/graphql", graphQlMiddle);

app.listen(3000, ()=>{
    console.log("Listening on 3000");
});