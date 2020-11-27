let fs;

let schedule = null;
let thisWeek = null;
let picks = null;
let choices = null;
let weekGames = null;
let games = [];
let submittingPicks = {};

var TABLE_OPEN = "<table class='table' style = 'overflow-x:auto margin: 0px' display: block>";
var TABLE_CLOSE = "</table>";
var TH_OPEN = "<th>";
var TH_CLOSE = "</th>"
var TR_OPEN = "<tr>";
var TR_CLOSE = "</tr>";
var TD_OPEN = "<td>";
var TD_CLOSE = "</td>";
var DIV_OPEN = "<div>";
var DIV_CLOSE = "</div>";



const getFirestore = async () => {
	if(!fs){
		fs = firebase.firestore();	
	}
	return fs;
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const loadDrinkCounter = async (fs) => {

  let allDrinkCounter = 0;

  let usersCollection = await fs.collection('users').get().then(function(users) {
  	users.forEach(function(user) {
  		allDrinkCounter += user.data().drinkCount;
  	})
  });

  $("#all_drink_counter").html(allDrinkCounter);

  if(allDrinkCounter >= countMessage.nice) {
    showNiceLink(false)
  } else {
    showNiceLink(true);
  }

  if(allDrinkCounter >= countMessage.dance) {
    showDanceLink(false)
  } else {
    showDanceLink(true);
  }

  if(allDrinkCounter === countMessage.nice) {
    showNiceModal();
  }

  if(allDrinkCounter === countMessage.dance) {
    showDanceModal();
  }

}

const showNiceLink = async (hide) => {
  $("#over_the_hump").attr("hidden", hide);
}

const showNiceModal = async () => {
  $("#nice-modal").modal({'show':true});
}

const showDanceLink = async (hide) => {
  $("#dance_modal_div").attr("hidden", hide);
}

const showDanceModal = async () => {
  $("#dance-modal").modal({'show':true});
}

const loadEverybody = async () => {
	let fs = firebase.firestore();
  	loadDrinkCounter(fs);

  	let allUsers = [];

	let usersCollection = await fs.collection('users').get().then(function(users) {
	  	users.forEach(function(user) {
	  		allUsers.push(user.data());
	  	})
	});

	sortedUsers = allUsers.sort(compare);

	let table;

	table = TABLE_OPEN;
	table += TR_OPEN;
	table += TH_OPEN + "Drinker" + TH_CLOSE;
	table += TH_OPEN + "Drinks" + TH_CLOSE;
  table += TH_OPEN + "Live Look" + TH_CLOSE;
	table += TR_CLOSE;

	sortedUsers.forEach(async function(user) {
		table += TR_OPEN;
		table += TD_OPEN + user.name + TD_CLOSE;
		table += TD_OPEN + user.drinkCount + TD_CLOSE;
    table += TD_OPEN + determineEmoji(user.drinkCount) + TD_CLOSE;
		table += TR_CLOSE;
	});

	table += TABLE_CLOSE;

	$("#user_drink_table").html(table);

}

function compare(a, b) {
  const aDrinks = a.drinkCount;
  const bDrinks = b.drinkCount;

  let comparison = 0;
  if (aDrinks < bDrinks) {
    comparison = 1;
  } else if (aDrinks > bDrinks) {
    comparison = -1;
  }
  return comparison;
}

const subtractOneDrink = async () => {
  let fs = firebase.firestore();

  let usersCollection = fs.collection('users');
  let currentUser = firebase.auth().currentUser;
  let currentDrinkCount = await usersCollection.doc(currentUser.uid).get().then(function(doc){
  	return doc.data().drinkCount;
  });

  let newDrinkCount = currentDrinkCount === 0 ? 0 : currentDrinkCount - 1;

  await usersCollection.doc(currentUser.uid).set(
	{
		name: currentUser.displayName,
		drinkCount: newDrinkCount
		
	});

  $("#signed_in_user_drinks").html(newDrinkCount);
  loadDrinkCounter(fs);
  loadEverybody();

  
}

const determineEmoji = (count) => {
  if(count === 0) {
    return '&#128118' //baby
  } else if (count > 0 && count <= 4) {
    return '&#128522' //smiley
  } else if (count > 4 && count <= 7) {
    return '&#129322' //party face
  } else if (count > 7 && count <= 10) {
    return '&#129326' //puke
  } else if (count > 10 && count <= 14) {
    return '&#129395' //partyhat 
  } else if (count > 14 && count <= 19) {
    return '&#129503' //zombie
  } else if (count > 19 && count <= 24) {
    return '&#128128' //skull
  } else {
    return '<img src="../brewcount/images/paul_bearer.gif" width=200>';
  }
}

const addOneDrink = async () => {
  let fs = firebase.firestore();

  let usersCollection = fs.collection('users');
  let currentUser = firebase.auth().currentUser;
  let currentDrinkCount = await usersCollection.doc(currentUser.uid).get().then(function(doc){
  	return doc.data().drinkCount;
  });

  let newDrinkCount = currentDrinkCount + 1;

  await usersCollection.doc(currentUser.uid).set(
	{
		name: currentUser.displayName,
		drinkCount: newDrinkCount
		
	});

  $("#signed_in_user_drinks").html(newDrinkCount);
  loadDrinkCounter(fs);
  loadEverybody();

  
}

const getFBUser = async () => {
	let firebaseUser = await firebase.auth().currentUser != null ? firebase.auth().currentUser : null;
	return firebaseUser;
}
