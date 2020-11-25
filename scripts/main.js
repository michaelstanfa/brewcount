let fs;

let schedule = null;
let thisWeek = null;
let picks = null;
let choices = null;
let weekGames = null;
let games = [];
let submittingPicks = {};

var TABLE_OPEN = "<table class='table' style = 'overflow-x:auto' display: block>";
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

  
}

const getFBUser = async () => {
	let firebaseUser = await firebase.auth().currentUser != null ? firebase.auth().currentUser : null;
	return firebaseUser;
}