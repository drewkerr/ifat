// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/student.html');
});


app.get("/:code", function (request, response) {
  console.log('Student loaded quiz ' + request.params.code);
  response.json({ length: results.code.key.length, choices: results.code.opt });
});

app.get("/teacher", function (request, response) {
  response.sendFile(__dirname + '/views/teacher.html');
});

app.get("/teacher/:code", function (request, response) {
  response.send(request.params.code);
});

app.post("/teacher", function (request, response) {
  console.log(request.params.key);
  var code = Math.random().toString(36).slice(-4);
  results[code] = { key: request.key, opt: 'ABCD', responses: {} }
  //response.redirect('/teacher/' + code);
});

app.get("/save", function (request, response) {
  
  console.log(request.query.question + request.query.response);
  
  if (results.code.key.charAt(request.query.question-1) == request.query.response) {
      response.send('correct');
  } else {
      response.send('incorrect');
  }
});

// Simple in-memory store for now
var results = {};

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
