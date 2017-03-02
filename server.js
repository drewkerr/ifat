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

app.get('/admin/json', function (request, response) {
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
  var key = request.query.key.toUpperCase();
  if (/^[A-D]+$/.test(key)) {
    var code = Math.random().toString(36).slice(-4);
    var user = Math.random().toString(36).slice(-6);
    db.get('results')
      .push({ code: code,
              user: user,
              key: key,
              opt: 'ABCD',
              feedback: request.query.feedback,
              responses: [] })
      .write();
    response.redirect('/admin/' + code + '/' + user + '/');
  } else {
    response.redirect('/admin?error=Invalid key');
  }
});

app.get('/admin/:code/:user', function (request, response) {
  var results = db.get('results')
                  .find({ code: request.params.code })
                  .value();
  if (!results || request.params.user !== results.user ) {
    response.redirect('/admin?error=Results unavailable');
  } else {
    response.render('results', { title: 'IF-AT Results', results: results });
  }
});

app.get('/admin/:code/:user/csv', function (request, response) {
  // get params
  var code = request.params.code;
  // load session results
  var results = db.get('results')
                  .find({ code: code })
                  .value();
  if (!results || request.params.user !== results.user ) {
    response.redirect('/admin?error=Results unavailable');
  } else {
    var csv = [];
    // generate headers: Names, Questions, Score
    var line = ['Name(s)'];
    for (var q = 1; q <= results.key.length; q++) {
      line.push('Question ' + q);
    }
    line.push('Score');
    //line.push('Score', 'Start', 'Finish');
    csv.push(line.join(','));
    // load session results by response r
    for (var r in results.responses) {
      // Names in double-quotes
      line = ['"'+results.responses[r].names+'"'];
      var score = 0;
      for (var q in results.responses[r].questions) {
        // Answers
        var a = results.responses[r].questions[q];
        line.push(a);
        // Score if a contains correct answer
        if (a.indexOf(results.key[q-1]) > -1) {
          switch(a.length) {
            case 1: score += 4; break;
            case 2: score += 2; break;
            case 3: score += 1; break;
            case 4: score += 0;
          }
        }
      }
      line.push(score);
      // Times with timezone offset from client
      // var start = results.responses[r].times[0];
      // var finish = results.responses[r].times[1] ? results.responses[r].times[1] : '';
      // line.push(start, finish);
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
  var code = request.query.code.toLowerCase();
  var user = Math.random().toString(36).slice(-6);
  var questions = {}
  var key = db.get('results')
              .find({ code: code })
              .get('key')
              .value();
  if (!request.query.name) {
    response.redirect('/?error=Please enter names');
  } else if (!key) {
    response.redirect('/?error=Incorrect code');
  } else {
    for (var q = 1; q <= key.length; q++) {
      questions[q] = '';
    }
    db.get('results')
      .find({ code: code })
      .get('responses')
      .push({ user: user,
              names: request.query.name,
              times: [new Date()],
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
  var feedback = db.get('results')
              .find({ code: request.params.code })
              .get('feedback')
              .value();
  if (!ans) {
    response.redirect('/?error=Session unavailable');
  } else {
    response.render('quiz', { title: 'Immediate Feedback Assessment Tool', feedback: feedback });
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
  if (request.query.complete) {
    db.get('results')
      .find({ code: code })
      .get('responses')
      .find({ user: user })
      .get('times')
      .push(new Date())
      .write();
    response.send(true);
  } else {
    var key = db.get('results')
                .find({ code: code })
                .get('key')
                .value();
    // existing answer
    var ans = db.get('results')
                .find({ code: code })
                .get('responses')
                .find({ user: user })
                .get('questions')
                .get(request.query.question)
                .value();
    // save result if not just reloading results & not already saved
    var q = request.query.question;
    var a = request.query.response;
    if (request.query.save == 'true' && ans.indexOf(a) == -1) {
      db.get('results')
        .find({ code: code })
        .get('responses')
        .find({ user: user })
        .get('questions')
        .set(q, ans + a)
        .write();
    }
    // if response is equal to answer key
    if (key.charAt(q-1) == a) {
        response.send(true);
    } else {
        response.send(false);
    }
  }
});

// Listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + listener.address().port);
});