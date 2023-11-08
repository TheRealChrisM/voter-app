//voter microservice
const express = require('express');
const app = express();

const { MongoClient } = require("mongodb");
const uri="mongodb://localhost:27017";
const client = new MongoClient(uri);

let port = 3002;

app.listen(port, ()=> console.log(`listening on port ${port}`));

app.get('/', async (request, response)=> {
    //load voter data - READ
    try{
        await client.connect();
        await client.db('voting').collection('voters')
        .find()
        .toArray()
        .then( results => {
            response.send(json.stringify(results));
        })
        .catch( error=> console.error(error));
    } catch (error){
        console.error(error);
    } finally{
        client.close();
    }
});