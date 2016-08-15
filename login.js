$(function() {
    //Initialize Things for the app to be functional

    //Creating the firebase reference.
    var firebaseref = new Firebase("https://weddingplanner-5a174.firebaseio.com");
    var database = firebase.database();

    //Global Variables for userData and the firebase reference to the list.
    var listRef = null;
    var userData = null;

    //timer is used for few animations for the status messages.
    var timer = null;


    firebase.auth().onAuthStateChanged(function(userData) {
        console.log("User Auth State chanced is triggered. " + userData);
        if (userData) {
            console.log("User logined");
            loadProfile();
            console.log("What happend?");
            setUpFirebaseEvents();
        } else {
            console.log("User logout");
            // No user is signed in.
            listRef = null;
        }
    });


    //Each user has a name. This function loads the profile for the user who logged in.
    //You can extend the functionality to add more data when saving the profile.
    var loadProfile = function() {
        userRef = firebaseref.child('users').child(userData.uid);
        userRef.once('value', function(snap) {
            var user = snap.val();
            if (!user) {
                return;
            }
            userData.fullname = user.full_name;
            addUserWelcome(userData.fullname);
            goToTab("#lists");
        });
    }


    //Handling Login Process
    $("#login-btn").on('click', function() {
        var email = $("#login-email").val();
        var password = $("#login-password").val();

        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            userData = firebase.auth().currentUser;
            console.log("Authenticated successfully with payload:" + userData.email);
            $("#login-btn").parent().find('.status').html("You are logged in as:" + userData.email).show();
            //loadProfile();
            //setUpFirebaseEvents();
        }).catch(function(error) {
            // Handle Errors here.
            console.log("Login Failed!", error);
            $("#login-btn").parent().find('.status').html("Login Failed!:" + error).show();
            userData = null;
        });
        // TODO add a function
    });

    $("#facebook-btn").on('click', function() {
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('user_birthday');
        provider.addScope('user_friends');
        provider.addScope('email');
        provider.addScope('public_profile');
        provider.addScope('user_location');

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // The signed-in user info.
            userData = result.user;
            $("#facebook-btn").parent().find('.status').html("You are logged in as:" + userData.email).show();

        }).catch(function(error) {
            $("#facebook-btn").parent().find('.status').html("Login Failed!:" + error).show();
            userData = null;
            // ...
        });

    });

    // TODO (merge)
    $("#twitter-btn").on('click', function() {
        var provider = new firebase.auth.TwitterAuthProvider();

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // The signed-in user info.
            userData = result.user;
            $("#twitter-btn").parent().find('.status').html("You are logged in as:" + userData.email).show();
        }).catch(function(error) {
            $("#twitter-btn").parent().find('.status').html("Login Failed!:" + error).show();
            userData = null;
            // ...
        });

    });

    $("#google-btn").on('click', function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // The signed-in user info.
            userData = result.user;
            $("#google-btn").parent().find('.status').html("You are logged in as:" + userData.email).show();
        }).catch(function(error) {
            $("#google-btn").parent().find('.status').html("Login Failed!:" + error).show();
            userData = null;
        });

    });

    //Handling Signup process
    $("#signup-btn").on('click', function() {

        var email = $("#email").val();
        var password = $("#password").val();
        userData = null;

        firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
            userData = firebase.auth().currentUser;

            console.log("Successfully created user account with uid:", userData.uid);

            $("#signup-btn").parents("#register").find('.status').html("Successfully created user account with uid:" + userData.email).show();

            console.log("Authenticated successfully with payload:", userData);
            updateProfile();
            loadProfile();
            setUpFirebaseEvents();

            goToTab("#lists");
        }).catch(function (error) {
            console.log("Error creating user:", error);
            $("#signup-btn").parents("#register").find('.status').html("Error creating user:" + error).show();
        });


    });

    var updateProfile = function() {
        var name = $("#name").val();
        userData.updateProfile({
            displayName: name,
            fullName: name,
            photoURL: "https://example.com/jane-q-user/profile.jpg"
        }).then(function() {
            console.log("Update user profile successfully:");
            $(".nav.navbar-nav > li > a[data-target='#login']").click();

        }, function(error) {
            console.log("Error adding user data:", error);
            $("#signup-btn").parent().find('.status').html("Error adding user data:" + error).show();
        });
    }
});