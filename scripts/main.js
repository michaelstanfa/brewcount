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
	table += TR_CLOSE;

	sortedUsers.forEach(function(user) {
		table += TR_OPEN;
		table += TD_OPEN + user.name + TD_CLOSE;
		table += TD_OPEN + user.drinkCount + TD_CLOSE;
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

  let newDrinkCount = currentDrinkCount - 1;

  await usersCollection.doc(currentUser.uid).set(
	{
		name: currentUser.displayName,
		drinkCount: newDrinkCount
		
	});

  $("#signed_in_user_drinks").html(newDrinkCount);
  loadDrinkCounter(fs);
  loadEverybody();

  
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