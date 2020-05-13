var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'bookwebdatabase'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.set("view engine","jade")

IS_LOG_SHOW=true



var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'konradnrog@gmail.com',
    pass: 'Windows10!47'
  }
});

function showLogMessagge(message){

	if(IS_LOG_SHOW)
		console.log(message)

}

app.use(express.static('ProjektAdmina'))

const fs = require('fs');


app.get("/fonte",function(e,r){
	r.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\css\\fontello.css")
})

app.get("/stylglowna",function(e,r){
	r.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\style.css")
})

app.get("/dajstyl",function(re,r){
    r.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\logincss.css")
})

app.get("/login",function(request,resposne){
    resposne.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\logowanie.html")
    
})

app.post('/auth', function(request, response) {
	var username = request.body.username;
  	var password = request.body.password;
    showLogMessagge("Próba logowania użytkownika:"+username)
  
   var passwordHash = require('password-hash');

   var hashedPassword = passwordHash.generate(password);
  
 

  if(username && password){
	connection.query("Select Password from user where EmailAdress=? or Login=?",[username,username],function(err,res,fie){
  	if(res.length>0){
  	
  		if(passwordHash.verify(password, res[0].Password)){
			 // response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\index.html")
			  var danes=[]
			
			 


			  connection.query("Select * from user ",function(err,res,fie){
				if(res.length>0){

					for(x of res){
						danes.push(x)
					//	showLogMessagge(x)
						for(var j in x){

						//danes.push(x[j])}

					}
				}
		
			
					response.render('index',{danes:danes})	
		
			
				}
		
			})
			
			 // response.end()
			  showLogMessagge("Próba udana")
   		
   
 		 }else {
				
 	 }	
	//response.end();

  }else{
	
  }
 // response.end();
 
})


  }else{
	showLogMessagge("Nie zalogowano (Błędne dane logowania):"+username)
	response.setHeader('Content-Type','application/json')
	response.end(JSON.stringify({isAuthenticationSucceeded:false,messageAuthentication:"Zły login lub hasło"}))
  } });

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});


app.get('/out', function(request, response) {
	if (request.session.loggedin) {
    request.session.loggedin=false;
		response.send('Goodbye , ' + request.session.username + '!');
	} else {
		response.send('But you don,t login');
	}
	response.end();
});

app.listen(3100);