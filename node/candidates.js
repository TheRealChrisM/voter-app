//candidate microservice

const http = require('http');
const url = require('url');

const { MongoClient } = require('mongodb');
const { match } = require('assert');

const mongoURI = "mongodb://localhost:27017";
//to getURI goto mongoSH db.getMongo()

const client = new MongoClient(mongoURI);

const hostname = "127.0.0.1";
const port = "3001";
const server = http.createServer();

server.on('request', async (request,response) => {
	//check path to determine what function to run
	let q = url.parse(request.url, true);
	//For holding the candidates to return!
	let returnCandidates = [];
	switch(q.pathname){
		case "/candidates":
			returnCandidates = await getCandidates();
			break;
		case "/candidates/ballots":
			returnCandidates = await getCandidatesWithBallots();
			break;
	}
	//now that we have data to return, send response
	response.writeHead(200, {'Content-type':'text/JSON'});
	response.end(JSON.stringify(returnCandidates));
})

server.on('error', error=>console.error(error.stack));

server.listen(port, hostname, () => console.log(`server running at http://${hostname}:${port}`));

async function getCandidates(){
	let values = [];
	const database = client.db('voting');
	const candidates = database.collection('candidates');
	const cursor = candidates.find({}).sort({ name: 1});
	while (await cursor.hasNext()){
		values.push(await cursor.next());
	}
	return values;
}

async function getCandidatesWithBallots(){
	let values = [];

	const database = client.db('voting');
	const candidates = database.collection('candidates');
	const ballots = database.collection('voters');
	const cursor = candidates.find({}).sort({name:1});
	while (await cursor.hasNext()){
		let thisCandidate = await cursor.next();
		const query = { "ballot.candidate":thisCandidate.name };
		const matchingVotes = await ballots.countDocuments(query);
		values.push({"_id":thisCandidate._id, "name":thisCandidate.name+' '+matchingVotes, "ballots": matchingVotes});
	}
	const nullQuery = {"ballot":null};
	const matchingVotes = await ballots.countDocuments(nullQuery);
	console.log(matchingVotes);
	console.log(Number(matchingVotes));
	console.log(matchingVotes==="");
	values.push({"_id":0, "name":"not voted"+' '+matchingVotes, "ballots": matchingVotes});
	return values;
}
