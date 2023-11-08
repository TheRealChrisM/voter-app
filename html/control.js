//This handles all of the Javascript for the Front-End aspect of the voting app.
const apiURIMapping = {};
apiURIMapping['candidates']='http://localhost/api/candidates';
apiURIMapping['candidatesWithBallots']='http://localhost/api/candidates/ballots';
apiURIMapping['voters']='http://localhost/api/voters'

//A mapping with global access that stores ballot information
let voterPackage = {};

//A mapping which allows for more standardized calls to the function which handles loading content.
const viewType = {
	home: "home",
	ballot: "ballot",
	results: "results",
}

//Sets up the page for display to user.
function initPage(){
	//Setting title for page.
	document.getElementById('heading').innerHTML="Candidates";
	loadContent(viewType["home"]);
	//Setup Modal Window
	var modal = document.getElementById("myModal");
	var modalBtn = document.getElementById("addBtn");
	var closeModalSpan = document.getElementById("close")[0];
	modalBtn.onclick=function() {
		modal.style.display = "block";
	}
	closeModalSpan.onclick = function() {
		modal.style.display = "none";
	}
	window.onclick = function(event) {
		if (event.target==modal){
			modal.style.display = "none";
		}
	}
	//Logic for the button which displays results
	var resultBtn = document.getElementById("showResults");
	resultBtn.onclick = function() {
		loadContent(viewType["results"]);
	}
}

//Queries the API endpoint for all the options a voter can make on the current ballot and create a list.
function fetchAndDrawBallot(){
	let candidateOptions = fetch(apiURIMapping['candidates'])
	.then(res=>res.json())
	.then(result=> {
		makeAList("candidateList", result, "name", processVote);
	})
}

//This function serves two purposes, the first being that it displays candidates in the current election when "false" is provided for the first parameter.
//The second purpose is when "true" is provided for the first parameter, it will also show the votes each candidate has.
function fetchAndListCandidates(showVotes){
	let apiTarget = "candidates";
	if (showVotes){
		apiTarget = "candidatesWithBallots";
	}
	//Query API to get a list of all candidates and create a list of them.
	let candidateOptions = fetch(apiURIMapping[target]);
	candidateOptions.then((result)=>result.json())
	.then((result)=> {
		makeAList('candidateList', result, "name");
	})
	.catch(error=> {
		let errorMessage="error accessing candidate list at target " + apiTarget + ".";
		console.error(errorMessage)
		document.getElementById('main').append(errorMessage);
	})
}

//This function makes an API call to get all the voters that are registered for the election.
function fetchAndDisplayRegisteredVoters(){
	let voterNames = fetch(apiURIMapping["voters"]);
	voterNames.then(res=>res.json())
	.then(result=> {
		const incompleteBallots = [];
		const completeBallots = [];
		for (voter of result){
			if (voter.ballot === null){
				incompleteBallots.push(voter);
			}
			else{
				completeBallots.push(voter);
			}
		}
		makeAList('incompleteBallots', incompleteBallots, "name", showBallot, true);
		makeAList('completeBallots', completeBallots, "name", false, true);
	})
}

//This function resets the view and displays a new view based on the provided input. The input must match with an option in the viewType mapping.
function loadContent(view){
	//Reset the view
	const applicationWindow = document.getElementsByClassName('displayArea');
	for (area of applicationWindow){
		area.innerHTML="";
	}
	switch(view){
		case viewType["home"]: {
			fetchAndListCandidates(false);
			fetchAndDisplayRegisteredVoters();
			break;
		}
		case viewType["ballot"]: {
			fetchAndDrawBallot();
			break;
		}
		case viewType["results"]: {
			fetchAndListCandidates(true);
		}
	}
}

//This is an onclick function which when a button is pressed will handle the logic of taking in the name provided and registering the voter.
function createVoterRecord() {
	//Grabs the name from the registration modal.
	let voterName = document.getElementById('userName').value;
	//Create new voter record in database.
	registerVoter(voterName);
	//Close the modal.
	closeSpan.onclick();
	//Reload the data and redraw the page so that the new voter registration is included.
	fetchAndDisplayRegisteredVoters();
	return false;
}

//This function handles the process of actually registering a new voter in the database.
async function registerVoter(voter){
	const data = {"name":voter};
	let registerVoter = await fetch(apiURIMapping['voters'],
	{
		method:"POST",
		headers:{
			'Accept':'application/json',
			'Content-type':'application/json'
		},
		body: JSON.stringify(data)
	})
	.catch(error=>console.log("error saving voter"));
	//TODO actually write the error to the page.
}

//This function takes in the name of the voter and calls the DELETE method on the API which results in removing the voter from the database.
//It then reloads the page after the DELETE action has been taken.
function deleteVoter(name){
	const voterPackage = {"name":name};
	let deleteVoter = fetch(apiURIMapping['voters'],
	{
		method: 'DELETE',
		headers: {
			'content-type':'application/json'
		},
		body: JSON.stringify(voterPackage)
	})
	.then(results=>results.json())
	.then((result)=>{
		statusMessage(result);
		loadContent(viewType["home"]);
	})
}

//This function submits a ballot for a registered voter and registers their vote for the desired candidate.
function processVote(){
	voterPackage.candidate=this.id;
	let addBallot = fetch(apiURIMapping['voters'],
	{
		method: 'PUT',
		headers: {'Content-Type':'application/json'},
		body: JSON.stringify(voterPackage)
	})
	.then(res=>res.json())
	.then((result)=> {
		statusMessage(result);
		voterPackage = {};
		loadContent(viewType["home"]);
	})
	.catch(error=>{
		console.error(error);
		statusMessage(error);
	})
}

function showBallot(){
	voterPackage.voter=this.id;
	loadContent(viewType["ballot"]);
}

//This webapp displays most data as lists on the page, this app takes in the data lists that we get from our API and writes them to the specified (target) element
//on the webpage.
function makeAList (target, data, idField, onClickFunction, includeDeleteVoterLink){
	const element = document.getElementById(target);
	//Clear current storage in target's list.
	element.innerHTML = "";
	let list = document.createElement('ul');
	for (let i=0; i<data.length; i++){
		let li = document.createElement('li');
		let span = document.createElement('span');
		let keyValue = data[i][idField];
		if (onClickFunction){
			span.onclick=onClickFunction
		}
		span.innerHTML = data[i].name;
		span.id=keyValue;
		li.append(span);
		if (includeDeleteVoterLink){
			let link = document.createElement('a');
			link.innerHTML = " [ x ] ";
			link.onclick = function(){
				deleteVoter(keyValue);
			}
			li.append(link);
		}
		list.appendChild(li);
	}
	element.append(list);
}

function statusMessage(message) {
	document.getElementById("messages").innerHTML=message;
}