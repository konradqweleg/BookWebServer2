var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');



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


IS_LOG_SHOW=true






function showLogMessagge(message){

	if(IS_LOG_SHOW)
		console.log(message)

}


require('./profilUser')(app,connection);
require("./loginAndRegister")(app,connection)
require("./bookAction")(app,connection)
































app.post('/registerUser', function(request, response) {
	
	var login = request.body.login;
	var email = request.body.email;
	var password=request.body.password;
	showLogMessagge("Rejestruję użytkownika:"+login)

	randomCode=randomCodeValityRegister(login)
	sendMailWithVerificationCode(randomCode,email)





var passwordHash = require('password-hash');
var hashedPassword = passwordHash.generate(password);

connection.query("DELETE FROM user_no_verify where login=\'"+login+"\' or email=\'"+email+"\'",function(err,res){
	if(err) throw err;
	showLogMessagge("Usuwam użytkownika z niezwerfikowanych")
})



connection.query("INSERT INTO user_no_verify values(null,\'"+randomCode+"\',\'"+hashedPassword+"\',\'"+login+"\',\'"+email+"\')",function(err,res){
	if(err) throw err;
	showLogMessagge("Dodaję użytkownika do użytkowników")

	
})



showLogMessagge("DODANO UŻYTKOWNIKA"+login)
response.setHeader('Content-Type','application/json')
	response.end(JSON.stringify({emailSend:true}))



		

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
   			 request.session.loggedin = true;
			request.session.username = username;
			response.setHeader('Content-Type','application/json')
			showLogMessagge("Zalogowano:"+username)
			response.end(JSON.stringify({isAuthenticationSucceeded:true,messageAuthentication:"Zalogowano"}))
   
 		 }else {
				response.setHeader('Content-Type','application/json')
				showLogMessagge("Nie zalogowano (Błędne dane logowania):"+username)
			response.end(JSON.stringify({isAuthenticationSucceeded:false,messageAuthentication:"Zły login lub hasło"}))
 	 }	
	response.end();

  }else{
	showLogMessagge("Nie zalogowano (Błędne dane logowania):"+username)
	response.setHeader('Content-Type','application/json')
	response.end(JSON.stringify({isAuthenticationSucceeded:false,messageAuthentication:"Zły login lub hasło"}))
  }
  response.end();
 
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

app.listen(3000);