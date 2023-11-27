//voter microservice
const express = require('express');
const app = express();

const { MongoClient } = require("mongodb");
const uri="mongodb://localhost:27017";
const client = new MongoClient(uri);

let port = 3002;

app.use(express.json());

app.listen(port, ()=> console.log(`listening on port ${port}`));
//CRUD FUNCTIONALITY

//CREATE
app.post('/', async (request, response)=> {
    const submittedVoterName = request.body.name;
    const voterData = {"name": submittedVoterName, "ballot":null};
    try {
        await client.connect();
        await client.db('voting').collection('voters')
        .insertOne(voterData)
        .then(results => response.send(results))
        .catch(error=> console.error(error));
    } catch(error){
        console.error(error);
    } finally {
        client.close();
    }
});

//READ
app.get('/', async (request, response)=> {
    //load voter data - READ
    try{
        await client.connect();
        await client.db('voting').collection('voters')
        .find()
        .toArray()
        .then( results => {
            response.send(results);
        })
        .catch( error=> console.error(error));
    } catch (error){
        console.error(error);
    } finally{
        client.close();
    }
});

//UPDATE AND PUT
app.put('/', async (request, response)=> {
    const submission = request.body.candidate;
    const voterFilter = {"name":request.body.voter};
    const updateDocument = {$set: {"ballot": {"name": submission}}};
    console.log(voterFilter);
    console.log(updateDocument);
    try{
        await client.connect();
        await client.db('voting').collection('voters')
        .updateOne(voterFilter, updateDocument)
        .then(results=>response.send(results))
        .catch(error=>console.error(error));
    } catch (error){
        console.error(error);
    } finally {
        client.close();
    }
});

//DELETE

app.delete('/', async (request, response)=> {
    const voterFilter = {"name": request.body.name};
    try{
        await client.connect();
        await client.db('voting').collection('voters')
        .deleteOne(voterFilter)
        .then(results=> response.send(results))
        .catch(error=>console.error(error));
    } catch(error) {
        console.error(error);
    } finally {
        client.close();
    }
});