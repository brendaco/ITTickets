/*  Author:     Carlton Louie, Brenda Coutino, Kianny Calvo
    Class:      CSC 337
    File:       index.js
    Assignment: Final Project
    This file is the JS for the login page
*/


var loginU = document.getElementById("loginU");
var loginP = document.getElementById("loginP");

var url = "http://127.0.0.1"

// Logs user into website
function login(){
    let u = loginU.value;
    let p = loginP.value;
    validUsrName = loginU.value;

    let requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username : u,
            password: p,
         }),
        redirect: "follow"
    };

    fetch(url + '/post/login', requestOptions)
        .then((response) => {
            if (response.status == 200){
                window.location.href = '/home';
            }
            else if (response.status == 201){
                window.location.href = '/home_admin';
            }
            else{
                alert("Incorrect Credentials")
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

var regU = document.getElementById("regU");
var regP = document.getElementById("regP");

// Registers a user on the website
function create(){
    let u = regU.value;
    let p = regP.value;

    let requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username : u,
            password: p
         })
    };

    fetch(url + '/post/newUser/', requestOptions)
        .then((response) => {
            if (response.status == 200){
                alert("New user registered!");
            }
            else{
                alert("Error making user, try again.");
            }
        });
}
