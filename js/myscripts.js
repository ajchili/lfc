var ref = new Firebase('https://lindrose-fcb.firebaseio.com/');
var errors = 0;

function successMessage(message) {
    $('#success').html(message);
    $('#successMessage').fadeTo(0, 1).hide(0).show(300).delay(3000).fadeTo(1250, 0.01).hide(300);
}

function errorMessage(message) {
    $('#error').html(message);
    $('#errorMessage').fadeTo(0, 1).hide(0).show(300).delay(3000).fadeTo(1250, 0.01).hide(300);
}

function redirect(location) {
    switch (location) {
        case 0:
            window.location.replace("http://www.kirinpatel.com/portfolio/2");
            break;
        case 1:
            window.location.replace("http://www.kirinpatel.com/portfolio/2/recipes.html");
            break;
        case 2:
            window.location.replace("http://www.kirinpatel.com/portfolio/2/add.html");
            break;
        case 3:
            window.location.replace("http://www.kirinpatel.com/portfolio/2/edit.html");
            break;
        default:
            window.location.replace("http://www.kirinpatel.com/portfolio/2");
    }
}

function gotoAdd() {
    var authData = ref.getAuth();
    if (authData) {
        ref.on("value", function(snapshot) {
            if(snapshot.child("users").child(authData.uid).child("WRITE").val() === true) {
                redirect(2);
            } else {
                redirect(1);
            }
        });
    } else {
        redirect(0);
    }
}

function fbRegister(JQuery) {
    var email = $('#email').val();
    var password = $('#password').val();
    var name = $('#name').val();
    if (name.length != 0) {
                console.log("User created succefully.");
                ref.createUser({
                    email: email,
                    password: password
                }, function (error, userData) {
                    if (error) {
                        switch (error) {
                            case "EMAIL_TAKEN":
                                console.error("The email is already in use.");
                                errorMessage(error);
                                break;
                            case "INVALID_EMAIL":
                                console.error("The specific email is invalid.");
                                errorMessage(error);
                                break;
                            default:
                                console.error("Error creating user: " + error);
                                errorMessage(error);
                        }
                    } else {
                        ref.child("users").child(userData.uid).update({NAME : name});
                        ref.child("users").child(userData.uid).update({WRITE : false});
                        successMessage("Account created!");
                        fbLogin();
                    }
                });
            } else {
                console.error("Name not provided.");
                errorMessage("Error. Name not provided.");
            }
}

function fbLogin(JQuery) {
    var email = $('#email').val();
    var password = $('#password').val();
    ref.authWithPassword({
        email: email,
        password: password
    }, function (error, authData) {
        if (error) {
            errors++;
            console.error("Login Failed! " + error);
            errorMessage(error);
        } else {
            ref.onAuth(function (authData) {
                if (authData) {
                    console.log("Login Succeful!");
                    successMessage("Your have logged in! Redirecting you now...");
                    redirect(1);
                } else {
                    console.error("Client unauthenticated.");
                }
            });
        }
    }, {
        remember: "sessionOnly"
    });
}

function fbCheck(JQuery) {
    var authData = ref.getAuth();
    if (authData) {
        ref.on("value", function(snapshot) {
            if(snapshot.child("users").child(authData.uid).child("WRITE").val() != true) {
                $('#add').hide(0);
            }
            $('#header').text("Welcome " + snapshot.child("users").child(authData.uid).child("NAME").val());
            var table = "<tr><th>Name</th><th>Ingredients</th><th>Steps</th><th>Uploader</th>";
            snapshot.child("recipes").forEach(function(childSnapshot) {
                var uid = snapshot.child("users").child(childSnapshot.child("UID").val()).child("NAME").val();
                if (authData.uid == snapshot.child("users").child(childSnapshot.child("UID").val()).key()) {
                    table = table + "<tr class=\"success\"><td>" + childSnapshot.child("NAME").val() + "</td>";
                } else {
                    table = table + "<tr><td>" + childSnapshot.child("NAME").val() + "</td>";
                }
                var ingredientNumber = 1;
                table = table + "<td>";
                childSnapshot.child("INGREDIENTS").forEach(function(childChildSnapshot) {
                    table = table + ingredientNumber + ". " + childChildSnapshot.val() + "<br>";
                    ingredientNumber++;
                })
                table = table + "</td>";
                var stepNumber = 1;
                table = table + "<td>";
                childSnapshot.child("STEPS").forEach(function(childChildSnapshot) {
                    table = table + stepNumber + ". " + childChildSnapshot.val() + "<br>";
                    stepNumber++;
                })
                table = table + "</td>";
                if (authData.uid == snapshot.child("users").child(childSnapshot.child("UID").val()).key()) {
                    //table = table + "<td><button class=\"btn btn-lg btn-primary btn-block disabled\" type=\"button\" onclick=\"redirect(3);\">Edit</button></td></tr>";
                    table = table + "<td><button class=\"btn btn-lg btn-primary btn-block disabled\" type=\"button\">Edit</button></td></tr>";
                } else {
                    table = table + "<td>" + uid + "</td></tr>";
                }
            });
            $('#recipes').html(table);
        });
    } else {
        redirect(0);
    }
}

function fbReset() {
    var email = $('#email').val();
    ref.resetPassword({
       email: email
    }, function(error) {
       if (error) {
           switch (error) {
               case "INVALID_USER":
                    console.error("The specified user account does not exist.");
                    error(error);
                    break;
                default:
                    console.log("Error resetting password:", error);
                    errorMessage(error);
                }
        } else {
            console.log("Password reset email sent successfully!");
            successMessage("Reset email sent!");
        }
    });
}

function fbLogout(JQuery) {
    ref.unauth();
    redirect(0);    
}

function fbAddRecipe(JQuery) {
    var authData = ref.getAuth();
    if (authData) {
        var name = $('#name').val();
        var text = $('#steps').val();
        var steps = new Array();
        steps = (text.split("\n"));
        var text = $('#ingredients').val();
        var ingredients = new Array();
        ingredients = (text.split("\n"));
        var exists = false;
        
        ref.on("value", function(snapshot) {
            snapshot.child("recipes").forEach(function(childSnapshot) {
                if (childSnapshot.child("NAME").val() === name) {
                    exists = true;
                }
            });
        });
        
        if (exists === false) {
            ref.child("recipes").child(name).update({NAME : name});
            var step = 1;
            steps.forEach(function(value) {
                ref.child("recipes").child(name).child("STEPS").child(step).set(value);
                step++;
            });
            var step = 1;
            ingredients.forEach(function(value) {
                ref.child("recipes").child(name).child("INGREDIENTS").child(step).set(value);
                step++;
            });
            ref.child("recipes").child(name).update({UID : authData.uid});
            redirect(1);
        } else {
            errorMessage("Recipe already exists, please try using a different name.");
        }
    } else {
        redirect(0);
    }
}

function fbEdit(JQuery) {
    
}

function fbCheckPrivilege(JQuery) {
    var authData = ref.getAuth();
    if (authData) {
        ref.on("value", function(snapshot) {
            if(snapshot.child("users").child(authData.uid).child("WRITE").val() != true) {
                redirect(1);
            }
        });
    } else {
        redirect(0);
    }
}

function fbResetPassword(JQuery) {
    ref.resetPassword({
       email : "kirtdude@gmail.com" 
    }, function(error) {
        if (error === null) {
            console.log("Password reset email sent successfully!");
        } else {
            console.error("Error sending password reset email: ", error);
        }
    });
}