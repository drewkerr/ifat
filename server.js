// server.js
// where your node app starts

// init project
var express = require('express');
var low = require('lowdb');
var fileAsync = require('lowdb/lib/storages/file-async');
var app = express();

// Start database using file-async storage
var db = low('.data/db.json', { storage: fileAsync });

// Set some defaults if JSON file is empty
db.defaults({ results: [] }).write();

app.set('view engine', 'pug');
// render readable HTML
app.locals.pretty = true;
app.set('json spaces', 2);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get('/admin/results', function (request, response) {
  response.json(db.getState());
});

app.get('/admin/reset', function (request, response) {
  response.json(db.set('results', []));
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/admin', function (request, response) {
  response.render('new', { title: 'IF-AT Administration', error: request.query.error });
});

app.get('/admin/new', function (request, response) {
  if (/^[A-D]+$/.test(request.query.key)) {
    var code = Math.random().toString(36).slice(-4);
    db.get('results')
      .push({ code: code,
              key: request.query.key,
              opt: 'ABCD',
              responses: [] })
      .write();
    response.redirect('/admin/' + code);
  } else {
    response.redirect('/admin?error=Invalid key');
  }
});

app.get('/admin/:code', function (request, response) {
  var results = db.get('results')
                  .find({ code: request.params.code })
                  .value();
  if (!results) {
    response.redirect('/admin?error=Results unavailable');
  } else {
    response.render('results', { title: 'IF-AT Results', results: results });
  }
});

app.get('/admin/:code/csv', function (request, response) {
  var code = request.params.code;
  var results = db.get('results')
                  .find({ code: code })
                  .value();
  if (!results) {
    response.redirect('/admin?error=Results unavailable');
  } else {
    var csv = [];
    var line = ['Names'];
    for (var q = 1; q <= results.key.length; q++) {
      line.push('Question ' + q);
    }
    line.push('Score');
    csv.push(line.join(','));
    for (var r in results.responses) {
      line = ['"'+results.responses[r].names+'"'];
      var score = 0;
      for (var key in results.responses[r].questions) {
        var ans = results.responses[r].questions[key];
        line.push(ans);
        score += 5 - ans.length;
      }
      line.push(score);
      csv.push(line.join(','));
    }
    var file = csv.join('\n')
    response.attachment('results-' + code + '.csv')
    response.send(file);
  }
});

app.get('/', function (request, response) {
  response.render('join', { title: 'Immediate Feedback Assessment Tool', error: request.query.error });
});

app.get('/join', function (request, response) {
  var code = request.query.code;
  var user = Math.random().toString(36).slice(-6);
  var questions = {}
  var key = db.get('results')
              .find({ code: code })
              .get('key')
              .value();
  if (!key) {
    response.redirect('/?error=Incorrect code');
  } else if (!request.query.name) {
    response.redirect('/?error=Please enter names');
  } else {
    for (var q = 1; q <= key.length; q++) {
      questions[q] = '';
    }
    db.get('results')
      .find({ code: code })
      .get('responses')
      .push({ user: user,
              names: request.query.name,
              start: new Date(),
              questions: questions })
      .write();
    response.redirect('/' + code + '/' + user + '/');
  }
});


app.get('/:code/:user', function (request, response) {
  var ans = db.get('results')
              .find({ code: request.params.code })
              .get('responses')
              .find({ user: request.params.user })
              .get('questions')
              .value();
  if (!ans) {
    response.redirect('/?error=Session unavailable');
  } else {
    response.render('quiz', { title: 'Immediate Feedback Assessment Tool'});
  }
});

app.get('/:code/:user/load', function (request, response) {
  var code = request.params.code;
  var user = request.params.user;
  var key = db.get('results')
              .find({ code: code })
              .get('key')
              .value();
  var opt = db.get('results')
              .find({ code: code })
              .get('opt')
              .value();
  var ans = db.get('results')
              .find({ code: code })
              .get('responses')
              .find({ user: user })
              .get('questions')
              .value();
  response.json({ length: key.length, choices: opt, answers: ans });
});

app.get('/:code/:user/save', function (request, response) {
  var code = request.params.code;
  var user = request.params.user;
  var key = db.get('results')
              .find({ code: code })
              .get('key')
              .value();
  var ans = db.get('results')
              .find({ code: code })
              .get('responses')
              .find({ user: user })
              .get('questions')
              .get(request.query.question)
              .value();
  if (request.query.save == 'true') {
    db.get('results')
      .find({ code: code })
      .get('responses')
      .find({ user: user })
      .get('questions')
      .set(request.query.question, ans + request.query.response)
      .write();
  }
  if (key.charAt(request.query.question-1) == request.query.response) {
      response.send(true);
  } else {
      response.send(false);
  }
});

// Listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + listener.address().port);
});