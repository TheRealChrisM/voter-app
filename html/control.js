


.catch(error=> {
	let errorMessage="error accessing candidate service";
	console.error(error);
	document.getElementById('main').append(errorMessage);
})


function loadVoters(){
	let voterNames = fetch(endpoint['voter']);
	voterNames.then( res => res.json() )
	.then ( result=> {
		const potentialBallots = [];
		const completedBallots = [];
		for ( item of result){
			if (item.ballot == null){
				potentialBallots.push(item);
			}else {
				completedBallots.push(item);
			}
		}
		makeAList('potentialBallots', potentialBallots);
		makeAList('completedBallots', completedBallots);
	})
}

function makeAList (target, data){
	const element=document.getElementById(target);
	//???
}