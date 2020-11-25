const buildUserInFirestore = async () => {
	console.log("redirect");
	let auth = await gapi.auth2.getAuthInstance();

	let e =await auth.currentUser.get().getBasicProfile();
	console.log(e);
	await firebase.auth().onAuthStateChanged(async function(user) {
		let fs = firebase.firestore();
		let usersCollection = fs.collection('users');

		usersCollection.doc(user.uid).get().then(async function(doc){
			if(!doc.exists) {
				console.log("getting " +  user + " signed up");
				let currentUser = await firebase.auth().currentUser;
				console.log(currentUser);
				await usersCollection.doc(currentUser.uid).set(
				{
					name: currentUser.displayName,
					drinkCount: 0
					
				});

			window.location.href = "./index.html";		

			}

		});
		
	});
}

function validateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true;
  }
    alert("Please enter a valid email address.")
    return false;
}
