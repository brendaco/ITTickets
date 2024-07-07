/*	Author: 	Carlton Louie
    Class:  	CSC 337
    File:		server.js
    Assignment:	Final Project
    This a JS file that handles all server side functionality
*/

const express = require('express');
const app = express();
const port = 80;
app.use(express.static('./public_html')); // Loads HTML for UI
const { default: mongoose } = require('mongoose');
const parser = require('body-parser');
const mongoDBURL = 'mongodb://127.0.0.1/Final';

mongoose.connect(mongoDBURL, {useNewUrlParser: true});
mongoose.connection.on('error', () => {
  console.log('There was a problem connection to mongoDB');
});

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});

var Schema = mongoose.Schema;

// Ticket schema
var ticketSchema = new Schema({
  title: String,
  user: String,
  priority: Number, // Between 0-9, 9 being the highest
  date: String,
  type: String,
  description: String,
  status: String, // Open, inprogress, and closed
  chats: []
});

// User schema
var userSchema = new Schema({
  username: String,
  password: String,
  priv: String, // u for user, a for admin
  tickets: []
});

var ticket = mongoose.model('model', ticketSchema);
var user = mongoose.model('user', userSchema);

// Hardcoded Admin into the system
var admin = new user({
  username: "admin",
  password: "admin",
  priv: 'a'
});


// LOGIN/REGISTRATION and AUTHORIZATION FUNCTIONS

// Post request to handle the registration of a "user"
app.post('/post/newUser/', (req, res) => { 
  let u = req.body.username;
  let p = req.body.password;

  let p1 = user.findOne({username : u}).exec(); // Looks to see if the username is taken
  p1.then( (results) => {
    if (results == null) { 
      var newUser = new user({
        username: u,
        password: p,
        priv: 'u'
      });
      let p2 = newUser.save();
      p2.then((doc => {
        res.sendStatus(200); // Status code for successful registration
      }))
      p2.catch((err) => {
        res.sendStatus(201);
        console.log('Error')
      });
    }
    else{
      res.sendStatus (201); // Status code for a used username
    }
  });
});

// Post request for logging in
app.post('/post/login', (req, res) => {
  let u = req.body.username;
  let p = req.body.password;

  let p1 = user.findOne({"username": u}).exec();
  p1.then((results) => {
    if (results == null){ // Checks if there is any user under the username
      res.sendStatus(202);
      return
    }
    else if (results.password == p){ // Checks if the password is valid
      if (results.priv == 'a'){ // Checks for an admin
        let sid = addSession(u, 'a'); // New cookie and session
        res.cookie("login", {username: u, sid: sid, priv: results.priv}, {maxAge:120000});
        res.sendStatus(201); // Status code for an admin login
      }
      else{
        let sid = addSession(u, 'u');
        res.cookie("login", {username: u, sid: sid, priv: results.priv}, {maxAge:120000});
        res.sendStatus(200); // Status code for a user login
      }
    }
    else{
      res.end("error");
    }
  });
  p1.catch((err) => {
    res.end(err);
  });
});

var sessions = {}; // Var to hold Session ID, Username and Privellage for client cookie comparison

// Adds a client's session to the sessions var
function addSession(user, adminPriv){
	let sessionId = Math.floor(Math.random()*100000);
	let sessionStart = Date.now();
	sessions[user] =  {'sid' : sessionId, 'start' : sessionStart, 'priv' : adminPriv};
  return sessionId;
}

// Checks if a client has a valid session ID
function doesUserHaveSession(user, sessionId){
  let entry = sessions[user];
  if (entry!=undefined) {
    return entry.sid == sessionId;
  }
}

//Checks if client has a valid session token
function auth(req, res, next){
  try{
    if(req.cookies != undefined || req.cookies != undefined){
      if(doesUserHaveSession(req.cookies.login.username, req.cookies.login.sid)){
        next();
      } 
    }
    else{
      return res.redirect(302, '/'); // Redirects to login page
    }
  }
  catch{
    return res.redirect(302, '/'); // Redirects to login page
  }
}

// Checks if user has a valid admin session
function checkAdmin(req, res, next){
  if (sessions[req.cookies.login.username].priv == 'a'){
    next()
  }
  else{
    res.end('Access Denied');
  }
}


// ADMIN FUNCTIONALITY

// Get request for the admin dashboard html page
app.get('/home_admin', auth, checkAdmin, (req, res) => {
  res.sendFile('./public_html/admin.html', {root: __dirname });
});

// Get request that returns JSON string of every ticket
app.get('/get/adminTickets', auth, checkAdmin, (req, res) => {
  let p1 = ticket.find({}).exec();
  p1.then( (results) => {
      res.end(JSON.stringify(results));
  });
  p1.catch( (err) => {
    res.end(err);
  });
});


// USER FUNCTIONALITY

// Get request that returns the user html page
app.get('/home', auth, (req, res) =>{
  res.sendFile('./public_html/home.html', {root: __dirname });
});

// Get request to return a user's tickets in a JSON string
app.get('/get/userTickets/', auth, (req,res) => {
  let u = req.cookies.login.username;
  let p1 = user.findOne({username : u}).exec();
  p1.then( (results) => {
    let id = results.tickets
    let p2 = ticket.find({_id: id}).exec()
    p2.then((results) => {
      res.end(JSON.stringify(results))
    });
    p2.catch((err) => {
      console.log("Couldn't find tickets");
      res.end("Couldn't find tickets")
    });
  });
  p1.catch((err) => {
    res.end(err);
  });
})

// Post request that handles making new tasks
app.post('/post/newTicket/', auth, (req, res) => {

  let t = req.body.title;
  let u = req.cookies.login.username;
  let p = req.body.priority;
  let date = req.body.date;
  let s = req.body.status;
  let typ = req.body.type;
  let desc = req.body.desc;

  let newTicket = new ticket({
    title: t,
    user: u,
    priority: p,
    date: date,
    type: typ,
    status: s,
    description: desc
  });

  let p1 = newTicket.save();
  p1.then((doc => {
    let id = doc._id.toString();
    console.log("New ticket: "+ t);
    let p2 = user.findOne({username: u}).exec(); // Looks for use to assign task to
    p2.then((doc =>{
      doc.tickets.push(id); // Appends user's ticket list
      let p3 = doc.save();
      p3.then((doc => {
        console.log("New ticket: "+ t + " added to: " + u);
        res.end('Success');
      }));
      p3.catch((err) => {
        console.log("Error saving to user");
        res.end('error');
      });
    }));
    p2.catch((err) => {
      console.log('User not found')
      res.end('error');
    });
  }));
  p1.catch((err) => {
    console.log('Error making ticket')
    res.end('error');
  });
});

// TICKET VIEWER PAGE FUNCTIONALITY

// Returns the html for the ticketView page
app.get('/ticketView', auth, (req,res) => {
  res.sendFile('./public_html/ticket.html', {root: __dirname });
});

// Sends a cookie of the ticket id used for ticketViewer
app.post('/post/ticketView', auth, (req,res) => {
  let id = req.body.ticketId
  res.cookie("ticketId", {id: id}, {maxAge:120000});
  res.sendStatus(200);
});

// Returns information for one ticket in a JSON string
app.get('/get/ticket/', auth, (req, res) => {
  
  // Used for displaying the update status buttons
  if (req.cookies.login.priv == 'a'){ // Checks for admin
    res.status(201);
  }
  else {
    res.status(200);
  }

  let id = req.cookies.ticketId.id;
  let p1 = ticket.findById(id).exec()
  p1.then((results) => {
    res.end(JSON.stringify(results));
  });
  p1.catch((err) => {
    res.end(err);
  });
});

// Posts a chat message to a ticket
app.post('/post/msg', auth, (req,res) => {
  let u = req.cookies.login.username;
  let id = req.cookies.ticketId.id;
  let msg = req.body.msg;
  let msgItm = [u, msg];
  let p1 = ticket.findById(id).exec()
  p1.then((results) => {
    results.chats.push(msgItm);
    let p2 = results.save();
    p2.then((results) => {
      res.sendStatus(200);
    });
  });
  p1.catch((err) => {
    res.end('Ticket not found');
  });
})

// Post request that updates status of a ticket
app.post('/post/updtStat', auth, checkAdmin, (req,res) => {
  let id = req.cookies.ticketId.id;
  let stat = req.body.stat;

  let p1 = ticket.findById(id).exec()
  p1.then((results) => {
    results.status = stat;
    let p2 = results.save();
    p2.then((results) => {
      res.end('stat saved');
    });
  });
  p1.catch((err) => {
    res.end('Ticket not found');
  });
});
