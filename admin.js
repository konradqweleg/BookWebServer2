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
	response.sendFile(path.join(__dirname + '/ProjektAdmina/login.html'));
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




app.get("/login",function(request,resposne){
    resposne.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
    
})



app.get('/priviligesTableShow',function(request,response){
	if(request.session.loggedin){
		response.redirect("http://176.111.31.64:3100/showTable?tableName=priviliges&fromShow="+request.query.fromShow)

	}else{
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
		showLogMessagge("Żądanie bez zalogowania!!!")	

	}

})

app.get('/writersTableShow',function(request,response){
	if(request.session.loggedin){
		response.redirect("http://176.111.31.64:3100/showTable?tableName=writers&fromShow="+request.query.fromShow)

	}else{
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
		showLogMessagge("Żądanie bez zalogowania!!!")	

	}
})


app.get('/user_no_verifyTableShow',function(request,response){
	if(request.session.loggedin){
		response.redirect("http://176.111.31.64:3100/showTable?tableName=user_no_verify&fromShow="+request.query.fromShow)

	}else{
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
		showLogMessagge("Żądanie bez zalogowania!!!")	

	}
})

app.get('/userTableShow',function(request,response){
	if(request.session.loggedin){
		response.redirect("http://176.111.31.64:3100/showTable?tableName=user&fromShow="+request.query.fromShow)

	}else{
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
		showLogMessagge("Żądanie bez zalogowania!!!")	

	}
})

app.get('/typeActivityTableShow',function(request,response){
	if(request.session.loggedin){
		response.redirect("http://176.111.31.64:3100/showTable?tableName=typeActivity&fromShow="+request.query.fromShow)

	}else{
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
		showLogMessagge("Żądanie bez zalogowania!!!")	

	}
})




app.get('/showTable',function(request,response){
	let from=0
	let nameTable=request.query.tableName
	showLogMessagge("Wyświetam tabele : "+nameTable)
	
	if (request.session.loggedin) {
		
	try{
		if(request.query.fromShow!=undefined ){
			 from=parseInt(request.query.fromShow);
			 showLogMessagge("Wyświetlam rekordy od "+request.query.fromShow+" do "+(from+15))
		   
		}else{
			from=0
		}
	}catch(err){
		from=0
		
	}	

	let responseQueryData=[]
	let showNextArrow=false	
	let showPrevoriousArrow=true
	showLogMessagge("Select * from "+nameTable+" limit "+from+",15")
	
	connection.query("Select * from "+nameTable+" limit "+from+",15",function(err,res,fie){
		try{
		if( res.length>0){
			for(x of res){
				responseQueryData.push(x)
			}
		
		
		if(from==0){
			showPrevoriousArrow=false
		}

		connection.query("Select * from "+nameTable,function(error,r,fl){
			
			if(parseFloat(r.length)>(from+15)){
				showNextArrow=true
			}
			let maxPage =Math.floor(parseFloat(r.length)/15)
			maxPage+=1
			
			var actualPage =Math.floor(parseFloat(from)/15)
			actualPage+=1
			from+=15
					
			response.render('showTableUser',{data:responseQueryData,showNextArrow:showNextArrow,showPrevoriousArrow:showPrevoriousArrow,from:from,actualPage:actualPage,maxPage:maxPage,nameTable:nameTable})
		})
					
	}}

	catch(Exception){
		var error=[""]	
		response.render('showTableUser',{data:error,showNextArrow:showNextArrow,showPrevoriousArrow:showPrevoriousArrow,from:from,actualPage:1,maxPage:1,nameTable:nameTable})
	}
		
})
}else{
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
		showLogMessagge("Żądanie bez zalogowania!!!")	

}
			

})

app.post('/auth', function(request, response) {
	var username = request.body.username;
  	var password = request.body.password;
    showLogMessagge("Próba logowania do panelu administratora użytkownika:"+username)
  
    var passwordHash = require('password-hash');

   
  
   if(username && password){
		connection.query("Select Password from user where (EmailAdress=? or Login=?) and HavePrivilagesId=2",[username,username],function(err,res,fie){
  		if(res.length>0){
  	
  		if(passwordHash.verify(password, res[0].Password)){
			request.session.loggedin=true
			request.session.username=username  
			response.redirect("http://176.111.31.64:3100/userTableShow?fromShow=0")
			showLogMessagge("Próba logowania udana!!!")
			
 		 }else {
			response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\loginError.html")
			showLogMessagge("Próba logowania nie udana!!!")	
 	 	}	
	

 		 }else{
			response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\loginError.html")
			showLogMessagge("Próba logowania nie udana!!!")	
 		 }
 
 
	})


  }else{
	response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\loginError.html")
	showLogMessagge("Próba logowania nie udana!!!")	
	
  } });



app.get('/out', function(request, response) {
	if (request.session.loggedin) {
   		showLogMessagge("Wylogowano:"+request.session.username) 
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
	} else {
		showLogMessagge("Próba wejśćia bez zalogowania")
		response.sendFile("C:\\Users\\Konrad\\Apka\\ProjektAdmina\\login.html")
	}

});

app.listen(3100);