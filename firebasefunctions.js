//extend jQuery to get Max z-index Value for organizing the Sticky Notes
jQuery.fn.extend({
    getMaxZ: function() {
        return Math.max.apply(null, jQuery(this).map(function() {
            var z;
            return isNaN(z = parseInt(jQuery(this).css("z-index"), 10)) ? 0 : z;
        }));
    }
});
$(function() {
	//Initialize Things for the app to be functional
	
	//Creating the firebase reference.
    var firebaseref = new Firebase("https://weddingplanner-5a174.firebaseio.com");
    var database = firebase.database();

    var userData = firebase.auth().currentUser;

    if (userData) {
        // User is signed in.
        console.log("User is signed in");
    } else {
        console.log("User is not signed in");
        // No user is signed in.
    }

	//Global Variables for userData and the firebase reference to the list.
    var listRef = null;

	//timer is used for few animations for the status messages.
	var timer = null;
	
	//Clear the Status block for showing the Status of Firebase Calls
    $(".status").removeClass('hide').hide();
	
	//Routing for the Tabs in the navbar
    goToTab = function(tabname) {
        if (tabname == "#lists") {
            if (userData === null) tabname = "#login";
        }
        $(".nav.navbar-nav > li > a").parent().removeClass('active');
        $(".nav.navbar-nav > li > a[data-target='" + tabname + "']").parent().addClass('active');
        $(".tab").addClass('hide');
        $(".tab" + tabname).removeClass('hide');
    }
	
	/*
	*Bind Events to the list item to provide more functionality.
	*You can extend this function to add more things like a Status button to mark items (for creating something like Trello!)
	*/
    var bindEventsToItems = function($listItem) {
        $listItem.draggable({
            containment: "#sharedlist",
            start: function() {
                var topzindex = $("#sharedlist li").getMaxZ() + 1;
                $(this).css('z-index', topzindex);
            },
            stop: function() {
                addCSSStringToItem($(this).attr('data-item-id'), $(this).attr('style'));
            }

        }).css('position', 'absolute');

        $listItem.find(".removebtn").on('click', function() {
            removeItemFromFirebase($(this).closest("[data-item-id]").attr('data-item-id'));
        });
    }
	
	//Some Utility Functions for making things pop!
	//In this app I am creating the list item at random position and with random color
	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function getRandomRolor() {
		var letters = '0123456789'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++) {
			var random = Math.round(Math.random() * 10);
			if (random == 10) random = 9;
			color += letters[random];
		}
		return color;
	}
	
	//Create a new list item with the data sent by firebase.
    var buildNewListItem = function(listItem, key) {
        var author = listItem.author;
        var content = listItem.content;
        var timestamp = listItem.timestamp;
        var id = key;
        var css = listItem.css;
        var $newListItem = $("<li data-item-id='" + id + "'></li>").html("<p class='itemauthor'>Added By - " + author +
            "<span class='removebtn'><i class='fa fa-remove'></i></span> " +
            "<span class='time'> on " + timestamp + "</span></p><p class='itemtext'>" + content + "</p>");
        $newListItem.prependTo($("#sharedlist"));
        $newListItem.attr('style', css);
        //$("#sharedlist").prepend($newListItem);
        bindEventsToItems($newListItem);
    }
	
	//Update Existing List Items(I am changing the CSS here to update the position of the list items)
    var updateListItem = function(listItem, key) {
        var author = listItem.author;
        var content = listItem.content;
        var timestamp = listItem.timestamp;
        var id = key;
        var css = listItem.css;
        $("#lists [data-item-id='" + id + "']").attr('style', css);
    }
	
	//Remove List Item from the page
    var removeListItem = function(key) {
        $("#lists [data-item-id='" + key + "']").remove();
    }
	

	//This function is called when a new child is added in Firebase. It calls buildNewListItem to add item to the page.
    var childAddedFunction = function(snapshot) {
        var key = snapshot.key();
        var listItem = snapshot.val();
        buildNewListItem(listItem, key);
        $("#lists .status").fadeIn(400).html('New item added!')
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            $("#lists .status").fadeOut(400);
        }, 2500);
    }
	
	//This function is called when an existing child is changed in Firebase. It calls updateListItem to change the css of the item on the page.
    var childChangedFunction = function(snapshot) {
        var listItem = snapshot.val();
        var key = snapshot.key();
        console.log("Key - " + key + " has been changed");
        console.log(listItem);
        updateListItem(listItem, key);
    }
	
	//This function is called when an existing child is removed from Firebase. It calls removeListItem to delete the item from the page.
    var childRemovedFunction = function(snapshot) {
        var key = snapshot.key();
		removeListItem(key)
        console.log('Child Removed');
    }
	
	//Setting the 3 firebase events to call different functions that handle the specific functionality of the app.
    var setUpFirebaseEvents = function() {
        listRef = firebase.database().ref('user-wedding/' + userData.uid);
        listRef.on('value', function(snapshot) {
            console.log("snapshot");
            console.log(snapshot.val());
            snapshot.forEach(function(childSnapshot) {
                // childData will be the actual contents of the child
                var wedding = childSnapshot.val();
                console.log('wedding object: ' + wedding);
                var weddingRef = database.ref('weddings/' + wedding);
                weddingRef.on('value', function(snapshot) {
                    var listItem = snapshot.val();
                    var author = listItem.uid;
                    var content = listItem.body;
                    var timestamp = listItem.timestamp;
                    var id = 'key_id';
                    //var css = listItem.css;
                    var $newListItem = $("<li data-item-id='" + id + "'></li>").html("<p class='itemauthor'>Added By - " + author +
                        "<span class='removebtn'><i class='fa fa-remove'></i></span> " +
                        "<span class='time'> on " + timestamp + "</span></p><p class='itemtext'>" + content + "</p>");
                    $newListItem.prependTo($("#sharedlist"));
                    //$newListItem.attr('style', css);
                    //$("#sharedlist").prepend($newListItem);
                    bindEventsToItems($newListItem);
                });
            });

        });
        $("#sharedlist").html('');
        // listRef.off('child_added', childAddedFunction)
        // listRef.on("child_added", childAddedFunction);
        //
        // listRef.off('child_changed', childChangedFunction);
        // listRef.on('child_changed', childChangedFunction);
        //
        // listRef.off('child_removed', childRemovedFunction);
        // listRef.on('child_removed', childRemovedFunction);
    }

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
	
	//Adds a welcome message when a user logs in.
    var addUserWelcome = function(user_name) {
        $(".welcome").html("<div class='alert alert-success'> Welcome <strong>" + user_name + "</strong></div>");
    }

	//Event to handle click for Adding Items
    $("#addItemToList").on('click', function() {
        var $content = $("#listitem");
        var content = $content.val();
        if (content === "") {
            $("#lists .status").html('Please enter the text for the new item!').fadeIn(400);
            return;
        }
        $("#listitem").val('');
        addListItem(content);
    });
	
	//Handler for sorting the items in rows neatly!
	//I kept trying to keep them in formation so ended up adding a button for it :)
    $("#sort-items").on('click', function() {
        var leftcounter = 0;
        var topcounter = 0;
        var topPos = 0;
        var e_topPos = 0;
        var e_leftPos = 0;
        $("#sharedlist li").each(function(index) {
            //We need to preserve the background color of the tiles, so each element will generate a specific css string
            topPos = $(this).outerHeight(true) > topPos ? $(this).outerHeight(true) : topPos;
            if (!leftcounter) {
                //lefcounter is zero -- new row of elements
                e_topPos = topcounter * topPos + 10;
                topcounter++;
            }
            e_leftPos = leftcounter * 33;
            leftcounter++;
            leftcounter = leftcounter % 3;
            var staticPosCSSString = $(this).clone().css({
                position: 'absolute',
                top: e_topPos + "px",
                left: e_leftPos + "%",
            }).attr('style');
            var key = $(this).attr('data-item-id');
            addCSSStringToItem(key, staticPosCSSString);
        });
    });

    //Handler for click events on the tabs.
    // my nav
    $(".nav.navbar-nav > li > ul > li > a").on('click', function(e) {
        var id = $(this).attr('id');
        if (id == "logout") {
            return;
        }

        $('#mainpage').hide();

        e.preventDefault();
        $(this).parent().addClass('active');
        //force if logged in
        if (userData !== null) {
            goToTab('#lists');
            return;
        } else {
            goToTab($(this).attr('data-target'));
        }
    });
	
	//Logout action handler
    $("#logout").on('click', function() {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        }, function(error) {
            // An error happened.
        });
        // TODO add a function for it.
        userData = null;
        listRef = null;
        $(".welcome").html('');
        goToTab('#login');
    });

	//Handling Login Process
    $("#login-btn").on('click', function() {
        var email = $("#login-email").val();
        var password = $("#login-password").val();

        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            console.log("Authenticated successfully with payload:", userData);
            userData = firebase.auth().currentUser;
            $("#login-btn").parent().find('.status').html("You are logged in as:" + userData.email).show();
            loadProfile();
            setUpFirebaseEvents();
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
    // TODO automatically generate some templates
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
	
	//Pushing new items to Firebase list. This is called when a user click on "AddNewItem Button"
    var addListItem = function(content) {
        // var postsRef = listRef;
        // var x = Date();
        // var random = randomIntFromInterval(1, 400);
        // var randomColor = getRandomRolor();
        // var topzindex = $("#sharedlist li").getMaxZ() + 1;
        // $temp = $("<li></li>");
        // $temp.css({
        //     'position': 'absolute',
        //     'top': random + 'px',
        //     'left': random / 2 + 'px',
        //     'background': randomColor,
        //     'z-index': topzindex
        // });
        // var css = $temp.attr('style');
        // try {
        //     var newItemRef = postsRef.push({
        //         author: userData.uid,
        //         content: content,
        //         timestamp: x,
        //         css: css
        //     });
        // } catch (e) {
        //     $("#lists").find(".status").html(e);
        // }
        var weddingData = {
            author: userData.displayName,
            uid: userData.uid,
            body: content,
            title: "Wedding",
            budget: 0,
            cost: 0,
            authorPic: "picture"
        };

        // Get a key for a new Wedding.
        var newWeddingKey = database.ref().child('weddings').push().key;

        // Write the new post's data simultaneously in the wedding list and the user's post list.
        var updates = {};
        updates['/weddings/' + newWeddingKey] = weddingData;

        var newRelationKey = database.ref().child('user-wedding').child(userData.uid).push().key;

        updates['/user-wedding/' + userData.uid + '/' + newRelationKey] = newWeddingKey;

        database.ref().update(updates);
    }
	
	//API call to remove items from Firebase
    var removeItemFromFirebase = function(key) {
        var itemRef = new Firebase('https://weddingplanner-5a174.firebaseio.com/lists/sharedlist/items/' + key);
        itemRef.remove();
    }
	
	//API call to update the existing item in Firebase with the latest CSS string.
    var addCSSStringToItem = function(key, css) {
        var itemRef = new Firebase('https://weddingplanner-5a174.firebaseio.com/items/' + key);
        itemRef.update({
            css: css,
        });
    }

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