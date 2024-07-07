/*	Author: 	Carlton Louie, Kianny Calvo, Brenda Coutino
    Class:		CSC 337
    File:		ticket.js
    Assignment:	Final Project
    This file is the javascript for the ticket page functionality.
*/

const url = "http://127.0.0.1"

// openForm allows the user to open the chat area

function openForm () {
    document.getElementById("chatForm").style.display = "block";
}

// closeForm allows the user to hide the chat area

function closeForm () {
    document.getElementById("chatForm").style.display = "none";
}

/*  sendMsg modifies ticket chats in the database by adding a user generated
    string to the end of the chats.
*/

function sendMsg(){
  msg = document.getElementById("userMsg").value;
  let requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        msg : msg,
     }),
  };

  fetch(url + '/post/msg', requestOptions)
      .then((response) => {
	  // page will reload to display the new message
          if (response.status == 200){
              showTicket();
          }
      })
      .catch((error) => {
          console.log(error);
      });
}

/*  The variables coll and i, and the for loop allows the admin user to click on a collapsible 
    button and display two other buttons.
*/

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

/*  The showTicket function first verifies the user privilege by checking the status code
    and then changing the collapsible display. Next it displays the ticket object data on the page.
    It uses a for loop to format how the chat string will appear in the chat area.
*/

function showTicket() {
  let url = '/get/ticket/';
	let p = fetch(url);
	let ps = p.then( (response) => {
		if (response.status === 200) {
      			document.getElementsByClassName("collapsible")[0].style.display = "none";
    		}
    return response.json()   
	}).then((object) => { 
    document.getElementsByTagName("h1")[0].innerHTML = "Ticket Id: " + object._id.slice(19, 24);
    document.getElementById("title").innerText = object.title;
    document.getElementById("client").innerText = object.user;
    document.getElementById("date").innerText = object.date;
    document.getElementById("type").innerText = object.type;
    document.getElementById("priority").innerText = object.priority; 
    document.getElementById("status").innerText = object.status;
    document.getElementById("description").innerText = object.description;
    
    let chatString = [];
    for (let i = 0; i < object.chats.length; i++){
      chatString[i] = object.chats[i][0] + " : " + object.chats[i][1] + "\n";
    }
    chatString = chatString.join("");
    document.getElementById("chatBox").innerText = chatString;
	}).catch(() => { 
	  alert('something went wrong');
	});
}

/*  The statusUpdate function uses the provided elements value to modify the 
    Ticket object's status. Upon completion of this action, the user will be alerted
    of the change and the showTicket function will be called to update the page's
    display.
*/

function statusUpdate(element) {
  let newStatus = element.value;
  let p = fetch(url + "/post/updtStat", {
    method: 'POST', 
    body: JSON.stringify({stat: newStatus}),
    headers: {"Content-Type": "application/json"}
    });
    p.then(() => { 
      console.log('Status Updated');
      alert("Status updated!");
      showTicket();
    });
    p.catch(() => { 
      alert('something went wrong');
    });
}

showTicket();
