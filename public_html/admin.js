/*	Author: 	Carlton Louie, Brenda Coutino, Kianny Calvo
	Class:  	CSC 337
	File:		admin.js
	Assignment:	Final Project
	This file is the JS for the admin-side of the service desk
*/

const url = "http://127.0.0.1"

// Sends a get request to get every ticket
function getTickets(){
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error');
        return false;
    }
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                showTickets(httpRequest.responseText);
            } 
            else { alert('Error fetching Items'); }
        }
    }
    httpRequest.open('GET', url + "/get/adminTickets");
    httpRequest.send();
}

var ticketBody = document.getElementById("adminTicketTable");

// Takes JSON objects of each ticket and displays it on the DOM
function showTickets(responseText){
    let tasks = JSON.parse(responseText);
    let taskStrings = []; // Array to hold strings for the entire body of the table

    for (let i in tasks){
        let taskString = '<tr>';
	// Function for opening ticket viewer
        let taskViewerFunc = "openTicket('"+tasks[i]._id+"');"; 
        // Makes the ID cell of the task clickable to open the ticket viewer
        let taskId = '<td onclick='+taskViewerFunc+'>' + tasks[i]._id.slice(19, 24) + '</td>';
        let time = '<td>' + tasks[i].date + '</td>';
        let priority = '<td>' + tasks[i].priority + '</td>';
        let status = '<td>' + tasks[i].status + '</td>';
        let title = '<td>' + tasks[i].title + '</td>';
        let type = '<td>' + tasks[i].type + '</td>';
        let user = '<td>' + tasks[i].user + '</td>';
        taskString=taskString + taskId + time + priority + status + title + type + user + "</tr>";
        taskStrings.push(taskString);
    }
    let htmlText =  taskStrings.join("");
    ticketBody.innerHTML = htmlText;
}

// Function for opening the ticketviewer page for a specific ticket using a post request
// Will retrieve a cookie for the specific ticket id and also redirect to ticket viewer
function openTicket(id){
    let requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ticketId : id,
        }),
    };
    fetch(url + '/post/ticketView', requestOptions)
        .then((response) => {
            if (response.status == 200){
                window.location.href = '/ticketView';
            }
            else if (response.status == 201){
                window.location.href = '/home_admin';
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

getTickets()
