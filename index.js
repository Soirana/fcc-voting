var express = require('express');
var fs = require('fs');
var Datastore = require('nedb');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;

var app = express();

passport.use(new Strategy({
    consumerKey: process.env['twitterkey'],
    consumerSecret: process.env['twittersecret'],
    callbackURL: 'https://soirana-peanuts.herokuapp.com/twitter/return'
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var db = new Datastore({ filename: 'peanuts.db', autoload: true });
app.use(bodyParser.json())
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

var html = fs.readFileSync('peanuts/peanutpoll.html');


app.use(express.static('peanuts'));
app.set('port', (process.env.PORT || 5000));

app.get('/agregate', function(request, response) {
	if ( request.xhr) {
		db.find({author: request.query.user}, function (err, docs) {
			if (docs.length>0) {
			for (var i = 1; i < docs.length; i++) {
				docs[0].poll = docs[0].poll.concat(docs[i].poll);
			}
			for (i = 0; i < docs[0].poll.length-1; i++) {
				for (var j = i+1; j < docs[0].poll.length; j++) {
					if (docs[0].poll[i].name === docs[0].poll[j].name) {
						docs[0].poll[i].votes += docs[0].poll[j].votes;
						docs[0].poll.splice(j,1);
						j--;
					}
				}
			}
			response.json(docs[0].poll);
		}else{
			response.json({name:"", votes:0});
		}

		});
	}	else{
		response.redirect('/');
	}
});

app.get('/initial', function(request, response) {
	var links= [], 
		authors = [];
	if ( request.xhr) {
		db.find({}, function (err, docs) {
			for (var i = 0; i < docs.length; i++) {
				links.push(docs[i].label);
				authors.push(docs[i].author);
			}
			response.json({links: links, authors: authors});
		});
	} else{
		response.redirect('/');
	}
});

app.get('/twitter', passport.authenticate('twitter'));

app.get('/twitter/return',
passport.authenticate('twitter', { failureRedirect: '/twitter' }), 
  function(req, res) {
  	console.log(req.user.username);
  	res.json({error: false, name: req.user.username});
  }); 


app.get('/create', function(request, response) {
	if ( request.xhr) {
		db.find({label: request.query.label},function(err, docs) {
			if (docs.length>0) {
				response.json({error: "name taken"});
			}else{
				db.insert(request.query);
				response.json({error: true});
			}
		});

	} else{
		response.redirect('/');
	}

});

app.get('/remove', function(request, response) {
	if ( request.xhr) {
		db.remove({ label: request.query.name}, {}, function (err, numRemoved) {});
	} else{
		response.redirect('/');
	}

});

app.get('/vote', function(request, response) {
	if ( request.xhr) {
		var holder = request.query;
		db.find({label: request.query.poll},function(err, docs) {
			var finder = docs[0].poll.slice();
			
			for (var i = 0; i< finder.length;i++){
				if (finder[i].name===holder.name) {
					finder[i].votes ++;
					break;
				}
			}
			if (i===finder.length) {
				finder.push({name: holder.name, votes:1});
			}

			db.update({label: holder.poll}, { $set: {poll: finder}});	
		});
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.end();
	} else{
		response.redirect('/');
	}
})



app.get('/poll', function(request, response) {
	var listas= [];
	var nameQuery = request.query.name;
	if ( request.xhr) {
		db.find({label : nameQuery}, function (err, docs) {
			response.json({name: docs[0].author,poll: docs[0].poll});
		});
		
	} else{
		response.redirect('/');
	}
});

app.get('/', function(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(html);
	});

app.get('/*', function(request, response) {
	var stringa = request.params[0];
	db.find({label : stringa}, function (err, docs) {
		if (docs.length >0){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(html);
		}else{
			response.redirect('/');
		}

	});
});




app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

