let currentGoogleUser;

function authenticate() {
    if(gapi.auth2.getAuthInstance().isSignedIn.get()){
        return gapi.auth2.getAuthInstance();
    } else {
      return gapi.auth2.getAuthInstance()
          .signIn({scope: "profile"})
          .then(function() {
              console.log("Sign-in successful");

              },
              function(err) { console.error("Error signing in", err); });   
  }
}

function getAuthenticatedUser() {
  let user = authenticate();
  return user;
}

function getSignedIn() {
  return gapi.auth2.getAuthInstance();
}

function loadClient() {
  return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/gmail/v1/rest")
      .then(function() { 
            console.log("GAPI client loaded for API");
            },
            function(err) { console.error("Error loading GAPI client for API", err); });
}

async function setUser() {

  await firebase.auth().onAuthStateChanged(async function(user) {

    if(user) {

      $("#all_data").attr("hidden", false);

      $("#user_first_last").html(user.displayName);
      $("#signed_in_user_drinks").html(doc.data().drinkCount)
      $("#login_html").attr("hidden", true);
      await hideLoginButton()
    }

  })

}


function hideLoginButton() {

  $("#sign_out").attr("hidden", false);
  $("#login_signup_header").attr("hidden", true);
  $("#sign_in_or_sign_up_to_pick_html").attr("hidden", true);

}

async function onSignIn(googleUser) {
  console.log('Google Auth Response', googleUser);
  let currentGoogleUser = googleUser;
  // We need to register an Observer on Firebase Auth to make sure auth is initialized.
  let firebaseUser = await firebase.auth().currentUser != null ? firebase.auth().currentUser : null;



  var unsubscribe = firebase.auth().onAuthStateChanged(async function(firebaseUser) {

    unsubscribe();
    // Check if we are already signed-in Firebase with the correct user.
 
    if (!isUserEqual(googleUser, firebaseUser)) {


      // Build Firebase credential with the Google ID token.
      var credential = await firebase.auth.GoogleAuthProvider.credential(
          googleUser.getAuthResponse().id_token);


      await firebase.auth().signInWithCredential(credential).then(async function(user) {
        $("#user_first_last").html(user.displayName);
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        })
        
        buildUserInFirestore();
    } else {
      $("#user_first_last").html(firebaseUser.displayName);
      let fs = firebase.firestore();

      let usersCollection = fs.collection('users');

      usersCollection.doc(firebaseUser.uid).get().then(function(doc){
        $("#signed_in_user_drinks").html(doc.data().drinkCount)
      });
      
      console.log('User already signed-in Firebase.');

    }

  });

  $("#calculate_record_button").attr("hidden", false);
  $("#user_record").attr("hidden", false);
  
}

function isUserEqual(googleUser, firebaseUser) {
  if (firebaseUser) {
    var providerData = firebaseUser.providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()) {

        return true;
      }
    }
  }
  return false;
}

async function onSignUp(firstSignUp) {

  let result = await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(
    function() {

      var provider = new firebase.auth.GoogleAuthProvider();

      provider.addScope('profile');
      provider.addScope('email');

      firebase.auth().signInWithRedirect(provider);
      firebase.auth().getRedirectResult().then(function(result) {});

    }
  );

  let fs = firebase.firestore();

  let usersCollection = fs.collection('users');

  $("#user_first_last").html(user.displayName);
  $("#signed_in_user_drinks").html(doc.data().drinkCount)

  hideLoginButton();

  return true;
}

function signoutProcess() {
  $("#all_data").attr("hidden", true);
  $("#sign_out").attr("hidden", true);
  $("#login_signup_header").attr("hidden", false);
  $("#user_first_last").html("");
  $("#picks_html").attr("hidden", true);
  $("#sign_in_or_sign_up_to_pick_html").attr("hidden", false);
  $("#admin_link_in_header").attr("hidden", true);
  $("#this_week_games_admin").html("");
  $("#this_week_scores_admin").html("");
  $("#admin_access_only").attr("hidden", false);
  $("#calculate_record_button").attr("hidden", true);
  $("#user_record").attr("hidden", true);
}

function signOutWithMessage(message) {

  console.log("signing out " + firebase.auth().currentUser.displayName);
  firebase.auth().signOut().then(function() {
    window.alert(message);
    signoutProcess();
  }).catch(function(error) {
    console.error(error);
  });
}

function signOut() {

  firebase.auth().signOut().then(function() {

    var auth2 = gapi.auth2.getAuthInstance();
    
    auth2.signOut().then(function () {
      // auth2.disconnect();
      console.log('User signed out.');
      signoutProcess()
    });
  
  }).catch(function(error) {
    // An error happened.
  });
}
