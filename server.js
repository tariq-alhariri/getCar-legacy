// Our holy server ...
var express = require('express');
var morgan = require('morgan');
var bodyParser=require('body-parser');
var path = require('path')
var coment = require("./db/Coment.js")
var user = require("./db/db.js"); // user database
var car = require("./db/carDB.js") // cars database
var contactus = require("./db/contactusDB.js") // contact us database
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var app = express();
var session = require("express-session");

// those two lines are for payload size so you can upload large files ...
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb'}));
/////
app.use(session({secret : "session"}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname + '/'));

// This variable will tell the app if there's anyone logged in.
var logged = false;

// This variable will hold the information of the logged in user.
// check line 111 ..
var userlogged = []

// This get will start at the beginning to bring all the data from the cars database
app.get('/data',function(req, res){
  //car.find({operation :'buy' }, function(err,data){
  	car.find({}, function(err,data){
  	// Pushing the logged in variable with the data
	data.push(logged ,userlogged);
	//console.log(data)
	// Sending data to the front end.
	res.json(data);
  });
});


// This get will start at clicking on profile and brings all the data from the cars database that the user logged in added before
app.get('/profile',function(req, res){
  //car.find({operation :'buy' }, function(err,data){
  	car.find({username:userlogged[0]}, function(err,data){
  	// Pushing the logged in variable with the data
	data.push(logged ,userlogged);
	//console.log(data)
	// Sending data to the front end.
	res.json(data);
  });
});




// This get will delete the car that the logged in user added before and clicked on delete button 
app.post('/profile/remove',function(req, res){
  	car.findByIdAndRemove(req.params._id, function(err,data){
  		var response={
  			message:"The car deleted successfully",
  			id:req.body._id
  		}
  });
  	res.status(200).send(response);
});
// This will Edit the car that the logged in user has 


app.post('/profile/edit',function(req, res){
	var _id = req.body._id
	var username = req.bodey.username;
	var eamil = req.body.email;
    var phone = req.body.phone;
	var image = req.body.image;
	var type = req.body.type;
    var color = req.body.color;
    var price = req.body.price;
    var  pickupPlace = req.body.pickupPlace;
    var returnPlace = req.body.returnPlace;
    var rentingPeriod = req.body.rentingPeriod;
    var rentingPrice = req.body.rentingPrice;

  //car.find({operation :'buy' }, function(err,data){
  	car.findByID(_id, function(err,data){
  	// Pushing the logged in variable with the data
	data.save(function(err){
		if(err)
			console.log('error')
		else 
			console.log('success')
	})
	//console.log(data)
	// Sending data to the front end.
	res.end();
  });
});


// The logIn post handling ..
app.post("/logIn",function(req,res){
	// Looking for the username ..
	user.findOne({username: req.body.user}, function(err, user){
		if (!user){ 
			res.send('Wrong UserName !');
		} else {
			// If found compare his password
			bcrypt.compare(req.body.password, user.password, function(err, hash){
				if(hash){
					// If matched begin a session ..
					req.session.regenerate(function(data) {
						// and assign him as logged.
						console.log(user)
						logged = true;
						userlogged.push(user.username, user.phone)
						res.end()
       						});

				} else {res.send('Worng Password !!');}

			});

		}	
	});	
});

// The logOut handling get.
app.get('/logout', function(req, res) {
/*	 Eliminate the session ..
	 hasta la vista BB ...
                        ______
                      <((((((\\\
                      /      . }\
                      ;--..--._|}
   (\                 '--/\--'  )
    \\                | '-'  :'|
     \\               . -==- .-|
      \\               \.__.'   \--._
      [\\          __.--|       //  _/'--.
      \ \\       .'-._ ('-----'/ __/      \
       \ \\     /   __>|      | '--.       |
        \ \\   |   \   |     /    /       /
         \ '\ /     \  |     |  _/       /
          \  \       \ |     | /        /
           \  \       \       /
*/
	req.session.destroy(function() {
		// Assign him as a quieter.
		logged = false;
		userlogged = [];
		res.end();
	});
});

// Don't go Senpai ..
// ༼ つ ಥ_ಥ ༽つ

// Please continue ..

// Our sign up post handler ..
app.post("/signUp",function(req,res){
	// hashing the password ..
	userlogged.push(req.body.name, req.body.numberPhon)
	bcrypt.hash(req.body.password, null, null, function(err, hash){
		// saving private {{req.body.name}} ..
		var userr = new user ({
			username: req.body.name,
			password: hash,
			phone: req.body.numberPhon,
			email: req.body.email });
// sorry, it's line 126 .
		userr.save(function(err, userr){
			if (err){
				console.log(err);
			};
		});
	});
	// Assigning him as a logger ...
	logged = true;
	res.end();
});

// Our add new car handler ..
app.post("/add",function(req,res){
	// saving the new car ..
	// oops!, check line 55 maybe ? ¯\_(ツ)_/¯
	var carr = new car ({
		username: req.body.username,
		phone: req.body.phone,
		type: req.body.type,
		color: req.body.color,
		price: req.body.price,
		image: req.body.image,
		operation:'buy'

	});
  carr.save(function(err, carr){
		if (err){
			console.log(err)
		};
	});
	res.end();
});
// post request to contact us 
app.post("/contactus",function(req,res){
	var newContactus = new contactus ({
		name: req.body.name,
		email: req.body.email,
		subject: req.body.subject,
		message: req.body.message
	});
  newContactus.save(function(err, newContactus){
		if (err){
			console.log(err)
		};
	});
	res.end('Thank You for Contacting US ');
});


// add coment 

app.post("/coment",function(req,res){
	console.log(req.body)
	var comment=new coment({username:req.body.username,txt:req.body.coment,carId:req.body.id});
	comment.save(function(err, c){
		if (err){
			console.log(err)
		}
	});
	coment.find({carId:req.body.id},function (err,data){
		if(err){
			console.log(err);
		}
		res.json(data);
	})
})

app.post("/coments",function(req,res){
	coment.find({carId:req.body.id},function (err,data){
		if(err){
			console.log(err);
		}
		res.json(data);
	})
})




app.post("/addtorent",function(req,res){
	
	// saving the new car ..
	// oops!, check line 55 maybe ? ¯\_(ツ)_/¯
	var carr = new car ({
		username: req.body.username,
		phone: req.body.phone,
		type: req.body.type,
		color: req.body.color,
		image: req.body.image,
		operation:'rent',
	    status:'available',
	    pickupPlace:req.body.pickupPlace,
	    returnPlace:req.body.returnPlace,
	    rentingPrice:req.body.price

	});
	console.log(carr)
  carr.save(function(err, carr){
		if (err){
			console.log(err)
		};
	});
	res.end();
});

// This get will start at the beginning to bring all the data from the cars database that are just for renting
app.get('/data/rent',function(req, res){
  car.find({operation :'rent' }, function(err,data){
  	// Pushing the logged in variable with the data
	data.push(logged ,userlogged);
	// Sending data to the front end.
	res.json(data);
  });
});




// Our wormHole ..
var port = process.env.PORT || 5000;
/*			 
        ________________________________         
       /                                "-_          
      /      .  |  .                       \          
     /      : \ | / :                       \         
    /        '-___-'                         \      
   /_________________________________________ \      
        _______| |________________________--""-L 
       /       F J                              \ 
      /       F   J                              L
     /      :'     ':                            F
    /        '-___-'                            / 
   /_________________________________________--"  
*/

// Start listening ...
app.listen(port, function() {

console.log("	   *   '*");
console.log("              *");
console.log("                   *");
console.log("                           *");
console.log("                  *");
console.log("                         *");
console.log(`you are now connected to:  ${port}`);
});
