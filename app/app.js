var express = require('express');
var http = require('http');

var routes = require('./modules/routes.js');
var importer = require('./modules/importer.js');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('CDqHZyw4v8NPxUWoecuA'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

// Gets
app.get('/', routes.index);
app.get('/projects', routes.hasToken, routes.getProjects);
app.get('/iterations', routes.hasToken, routes.getIterations);
app.get('/stories', routes.hasToken, routes.getStories);

// Posts
app.post('/addStory', routes.hasToken, routes.addStory);
app.post('/moveStory', routes.hasToken, routes.moveStory);
app.post('/updateStory', routes.hasToken, routes.updateStory);
app.post('/addStoryComment', routes.hasToken, routes.addStoryComment);

// JIRA Importer
app.get('/getImportLog', importer.getImportLog);
app.post('/getImportableProjects', importer.getImportableProjects);
app.post('/importProject', importer.importProject);

// Teamcity
app.get('/getTeamcityBuildStatus', routes.hasToken, routes.getTeamcityBuildStatus);

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

function requireSecure(req, res, next){
  if(!req.secure){
    res.redirect('https://'+req.host+req.originalUrl);
    console.log('redirecting to https://'+req.host+req.originalUrl);
  } else {
    next();
  };
}

// place before any other route to ensure all requests https
app.all('*', requireSecure);


