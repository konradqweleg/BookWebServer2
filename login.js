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


const fs = require('fs');

app.get('/download', function(req, res){

	var file = fs.readFileSync(__dirname + '\\arar.apk', 'binary');
  
	res.setHeader('Content-Length', file.length);
	res.write(file, 'binary');
	res.end();
  });


  Date.prototype.addHours=function(h){
	  this.setTime(this.getTime()+(h*60*60*1000))
	  return this
  }

  function addResetPasswordCodeToPasswordResetTable(email,code){
	showLogMessagge("Kopiuję dane do tabeli password reset")
	connection.query("Select * from user where EmailAdress=?",[email],function(err,res,fie){
		if(res.length>0){
			

	
			connection.query("DELETE FROM password_reset where IdUser="+res[0].IdUser,function(err,res){
				if(err) throw err;
				
			})		

			futureExpireDateCode=new Date().addHours(2)
			
	connection.query("INSERT INTO password_reset values(null,"+res[0].IdUser+",\'"+code+"\',\'"+ futureExpireDateCode.getFullYear()+"-"+(futureExpireDateCode.getMonth()+1)+"="+futureExpireDateCode.getDate()+"-"+futureExpireDateCode.getHours()+"-"+futureExpireDateCode.getMinutes()+"-"+futureExpireDateCode.getSeconds()+"\'"+")",function(err,res){
		if(err) throw err;
		
	
		
	})
			


		}

	})




  }


app.get("/checkIfAccountExsistAndSendOnMailResetPasswordCode",function(request,response){

	var email=request.query.mail
	showLogMessagge("Próba resetu hasła przez:"+email)
	var isAccountExist=false
	connection.query("Select * from user where EmailAdress=?",[email],function(err,res,fie){
		if(res.length>0){
			isAccountExist=true
			passwordResetCode=randomCodeValityRegister(res[0].Login)
			sendMailPasswordResetCode(passwordResetCode,email)
			showLogMessagge("Wysyłam kod resetu hasłą do:"+email)
			addResetPasswordCodeToPasswordResetTable(email,passwordResetCode)
			response.setHeader('Content-Type','application/json')
			response.end(JSON.stringify({emailInDatabase:isAccountExist}))
			
			


		}else{
			response.setHeader('Content-Type','application/json')
			response.end(JSON.stringify({emailInDatabase:isAccountExist}))

		}

	})

	
	

})



app.get("/registerUserCodeVerify",function(request,resposne){
	var code=request.query.code;

	showLogMessagge("Użytkownik użył kodu aktywująćegi konto")
	var passwordCopy="";
	var emailCopy="";
	var loginCopy="";
	
	connection.query("Select * from user_no_verify where validCode=?",[code],function(err,res,fie){
		if(res.length>0){
			
			passwordCopy=res[0].password;
			loginCopy=res[0].login;
			emailCopy=res[0].email;
			showLogMessagge("Użytkownik:"+loginCopy)
			


			connection.query("DELETE FROM user where login=\'"+loginCopy+"\' or EmailAdress=\'"+emailCopy+"\'",function(err,res){
				if(err) throw err;
				
			})

			connection.query("DELETE FROM user_no_verify where login=\'"+loginCopy+"\' or email=\'"+emailCopy+"\'",function(err,res){
				if(err) throw err;
				
			})


			connection.query("INSERT INTO user values(null,\'"+emailCopy+"\',\'"+passwordCopy+"\',\'"+loginCopy+"\',\'"+1+"\')",function(err,res){
				if(err) throw err;
			
				console.log("insert")
			})
		

			

		}


	})

	

	resposne.setHeader('Content-Type','application/json')
	resposne.end(JSON.stringify({send:true}))


//	resposne.redirect("http://176.111.31.64:3000/welcome")

	//resposne.sendFile(path.join(__dirname + '/z.html'));
	
	


})



app.post("/changePassword",function(request,response){
var code=request.body.code;
var newPassword=request.body.newPassword;
var passwordHash = require('password-hash');
newPassword = passwordHash.generate(newPassword);
showLogMessagge("Zmieniam hasło kod= "+code+ "nowe hasło "+newPassword)

connection.query("Select * from password_reset where CodePasswordReset=?",[code],function(err,res,fle){
	if(res.length>0){
		connection.query("Update user set Password=? where idUser=?",[newPassword,res[0].IdUser],function(e,r,t){
			showLogMessagge("Zmiana hasła udana")
			connection.query("DELETE FROM password_reset where CodePasswordReset=?",[code],function(err,res){
				if(err) throw err;
				showLogMessagge("Usuwam dane hasła ze zmian")
				response.setHeader('Content-Type','application/json')
				response.end(JSON.stringify({isGoodChangePassword:true}))
			})
		})
	}
})






})


app.post("/checkAvailableEmailAndLogin",function(request,response){
var userEmail=request.body.email
var userLogin=request.body.login


showLogMessagge("Sprawdzam czy dostępny jest mail:"+userEmail+" i login:"+userLogin)


var ifEmailInDatabase=false
	
	var ifLoginInDatabase=false

connection.query("Select * from user where EmailAdress=? or Login=?",[userEmail,userLogin],function(err,res,fie){
	if(res.length>0){
		
		for(x of res){ 
		
			if(x.EmailAdress==userEmail){
				ifEmailInDatabase=true
				
			}

			if(x.Login==userLogin){
				ifLoginInDatabase=true
			
			}


			if(ifLoginInDatabase && ifEmailInDatabase){
				break
			}
		}

	}


	if(!ifEmailInDatabase && !ifLoginInDatabase){
		showLogMessagge("Dostępny login :"+userLogin+" i email:"+userEmail)
	}else{
		if(ifEmailInDatabase){
			showLogMessagge("Email:"+userEmail+" jest zajęty")
		}

		if(ifLoginInDatabase){
			showLogMessagge("Login:"+userLogin+" jest zajęty")
		}


	}
			
	response.setHeader('Content-Type','application/json')
	response.end(JSON.stringify({isLoginAvailability:!ifLoginInDatabase,isEmailAvailability:!ifEmailInDatabase}))

})})


function randomCodeValityRegister(loginUser){
	var validCode=""
	for(i=0;i<7;++i){
	validCode+=randomInt(1,10)
	}

	showLogMessagge("Wygenerowany kod logowania to: "+loginUser+validCode)
	return loginUser+validCode
}





function sendMailPasswordResetCode(code,destinationMail){
	var mailOptions = {
		from: 'konradnrog@gmail.com',
		to: destinationMail,
		subject: 'BookWeb restore password',
		html: "<a target='_blank' href=\"http://176.111.31.64:3000/restorePassword?code="+code+"\"> Resetuj hasło </a>"
	  };
	  
	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		//  console.log(error);
		showLogMessagge("Błąd wysłania e-maila "+error)
		} else {
		 showLogMessagge("Mail wysłany")
		}
	  });


}


function sendMailWithVerificationCode(code,destinationEmailAdress){
	
showLogMessagge("Wysyłam maila z kodem aktywacyjnym na adres:"+destinationEmailAdress)




var mailOptions = {
	from: 'konradnrog@gmail.com',
	to: destinationEmailAdress,
	subject: 'BookWeb activation link',
	html: "<a target='_blank' href=\"http://176.111.31.64:3000/registerUserCodeVerify?code="+code+"\"> Aktywuj konto </a>"
  };
  
  transporter.sendMail(mailOptions, function(error, info){
	if (error) {
	//  console.log(error);
	showLogMessagge("Błąd wysłania e-maila "+error)
	} else {
	 showLogMessagge("Mail wysłany")
	}
  });

}

app.get("/getDataBook",function(request,response){
	let idBook=request.query.idBook





})


app.post("/markBook",function(req,response){
var mark=req.body.mark
var opinion=req.body.opinion
var email=req.body.mail;
var idBook=req.body.idBook

var idUser=0
showLogMessagge("Ocenia książkę użytkownik o mailu :"+email)
connection.query("SELECT IdUser from user where EmailAdress='"+email+"'",function(er,res,x){
	if(res.length>0){
		idUser=res[0].IdUser
		showLogMessagge("Id użytkownika to:"+idUser)



		connection.query("Select * from single_book_mark where IdUser= "+idUser+" and IdBook="+idBook,function(er,res){
			if(res.length>0){
				
				showLogMessagge("Zniana oceny zapytanie:"+"UPDATE single_book_mark set MarkBook="+mark+", UserOpinion='"+opinion+"' where IdUser="+idUser+" and IdBook="+idBook)
		connection.query("UPDATE single_book_mark set MarkBook="+mark+", UserOpinion='"+opinion+"' where IdUser="+idUser+" and IdBook="+idBook ,function(err,res){
			//	if(err) throw err;
			//	showLogMessagge("Dodaję użytkownika do użytkowników")
			showLogMessagge("Wstawiłem ocenę")
				///
				response.setHeader('Content-Type','application/json')
				response.end(JSON.stringify({good:"good"}))
			//})
			
			
			
			
			})

			}else{
				showLogMessagge("Ocena: "+mark+" Opinia "+opinion+" mail "+email+" id"+idUser+" idbook"+idBook )
		showLogMessagge("insert into single_book_mark values(null,"+idUser+","+mark+","+"'"+opinion+"',"+idBook+")")
		connection.query("INSERT into single_book_mark values(null,"+idUser+","+mark+","+"'"+opinion+"',"+idBook+") " ,function(err,res){
			//	if(err) throw err;
			//	showLogMessagge("Dodaję użytkownika do użytkowników")
			showLogMessagge("Wstawiłem ocenę")
				///
				response.setHeader('Content-Type','application/json')
				response.end(JSON.stringify({good:"good"}))
			//})
			
			
			
			
			})

			}
		})		

		
	}
})



})











app.get("/getUsersMarkStatistics",function(request,response){
	let idBook=request.query.idBook;
	var markMap=new Map()
	markMap.set("1","0")
	markMap.set("2","0")
	markMap.set("3","0")
	markMap.set("4","0")
	markMap.set("5","0")
	markMap.set("6","0")
	markMap.set("7","0")
	markMap.set("8","0")
	markMap.set("9","0")
	markMap.set("10","0")


	connection.query("SELECT MarkBook as markId,count(IdUser) as quant FROM `single_book_mark` where IdBook="+idBook+ " group by MarkBook" ,function(er,res,x){
		response.setHeader('Content-Type','application/json')


		if(res.length>0){
			for(let one of res){
				
				markMap.set(one.markId.toString(),one.quant)	
				
			}
		
		
		}

		

		
		response.end(JSON.stringify({mark_1:markMap.get("1"),mark_2:markMap.get("2"),mark_3:markMap.get("3"),mark_4:markMap.get("4"),mark_5:markMap.get("5"),mark_6:markMap.get("6"),mark_7:markMap.get("7"),
		mark_8:markMap.get("8"),mark_9:markMap.get("9"),mark_10:markMap.get("10"),}))



	})
})








app.get("/returnUserBookMark",function(req,response){
	
	let emailUser=req.query.email
	let idBook=req.query.idBook
	showLogMessagge("select single_book_mark.MarkBook as mark,single_book_mark.UserOpinion as opinion from user INNER join single_book_mark on single_book_mark.IdUser=user.IdUser where user.EmailAdress='"+emailUser+"' and single_book_mark="+idBook)
	
	showLogMessagge("Ocena ksiażki użytkownika : "+emailUser)
	connection.query("select single_book_mark.MarkBook as mark,single_book_mark.UserOpinion as opinion from user INNER join single_book_mark on single_book_mark.IdUser=user.IdUser where user.EmailAdress='"+emailUser+"' and single_book_mark.IdBook="+idBook,function(er,res,x){
		response.setHeader('Content-Type','application/json')
		if(res.length>0){
		
		response.end(JSON.stringify({mark:res[0].mark,opinion:res[0].opinion+" "}))
		}else{
			response.end(JSON.stringify({mark:-1,opinion:"sztos"+" "}))	
		}
	})
	
	
	
	})

app.get("/IfUserVotedBook",function(req,response){
	
let emailUser=req.query.email
let idBook=req.query.idBook

showLogMessagge("Czy user ocenił ksiżkę: "+emailUser)
connection.query("select *from user INNER join single_book_mark on single_book_mark.IdUser=user.IdUser where user.EmailAdress='"+emailUser+"' and  single_book_mark.IdBook="+idBook,function(er,res,x){
	response.setHeader('Content-Type','application/json')
	if(res.length>0){
		showLogMessagge("TAK")
	response.end(JSON.stringify({ifUserGiveMark:true}))
	}else{
		showLogMessagge("NIE Xd")
		response.end(JSON.stringify({ifUserGiveMark:false}))
	}
})



})


app.get("/HowManyBookAboutId",function(req,response){

	let idBook=req.query.idBook;

showLogMessagge("ile jest ksiażek o id "+idBook)


connection.query("SELECT user.login as userName,single_book_mark.MarkBook as userMark,single_book_mark.UserOpinion as userOpinion,count(user.login) as howManyComments  FROM `book` inner join single_book_mark on single_book_mark.IdBook=book.idBook inner join user on user.IdUser=single_book_mark.IdUser where book.idBook="+idBook,function(er,res,x){
	if(res.length>0){
		response.setHeader('Content-Type','application/json')
		showLogMessagge("Takich ksiażek jest"+res[0].howManyComments)
		response.end(JSON.stringify({userName:res[0].userName,userMark:res[0].userMark,userOpinion:res[0].userOpinion,howManyComments:res[0].howManyComments}))
	}


})
})


app.get("/getCommentBook",function(req,response){
let idBook=req.query.idBook;
let position=req.query.position;
showLogMessagge("Pokazuje komentarz ksiażki o id "+idBook+" a pozycja "+position)


connection.query("SELECT user.login as userName,single_book_mark.MarkBook as userMark,single_book_mark.UserOpinion as userOpinion FROM `book` inner join single_book_mark on single_book_mark.IdBook=book.idBook inner join user on user.IdUser=single_book_mark.IdUser where book.idBook="+idBook+" limit "+position+" ,1",function(er,res,x){
	if(res.length>0){
		response.setHeader('Content-Type','application/json')
		response.end(JSON.stringify({userName:res[0].userName,userMark:res[0].userMark,userOpinion:res[0].userOpinion,howManyComments:'1'}))
	}


})


})



app.get("/getImageBook",function(request,response){
	let numberBook=request.query.numberBook;

	response.sendFile("C:\\BookWebServer\\img\\"+numberBook+".jpg")

})



app.post("/deleteYoursMarkBook",function(request,response){
	let idBook=request.body.IdBook;
	showLogMessagge("Usuwam ocenke")
	let emailUser=request.body.emailUser;
	showLogMessagge("SELECT user.IdUser as user FROM `single_book_mark` inner join user on user.IdUser=single_book_mark.IdUser where user.EmailAdress='"+emailUser+"' and single_book_mark.IdBook="+idBook)
	connection.query("SELECT user.IdUser as user FROM `single_book_mark` inner join user on user.IdUser=single_book_mark.IdUser where user.EmailAdress='"+emailUser+"' and single_book_mark.IdBook="+idBook,function(er,res,x){
		if(res.length>0){
			showLogMessagge("Usuwam ocenę ks:"+idBook+" usera:"+res[0].user)
			connection.query('Delete from single_book_mark where IdUser='+res[0].user+" and IdBook="+idBook)
			response.end(JSON.stringify({ok:"ok"}))
		}
	})

})




app.get("/howManyBookWithOneCategoryFilter",function(request,response){
	let category=request.query.category
	let markStart=request.query.markStart
	let markEnd=request.query.markEnd
	let yearsStartPublish=request.query.yearsStartPublish
	let yearsEndPublish=request.query.yearsEndPublish
	let authorsName=request.query.authorsName
	let authorsSurname=request.query.authorsSurname
showLogMessagge("Filter 2:select count(*) as how from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%"+category+"\%' and book.yearPublish>"+yearsStartPublish+" and book.yearPublish<"+yearsEndPublish+" and writers.name like '\%"+authorsName+"\%' and writers.surname like '\%"+authorsSurname+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  having ROUND(avg(single_book_mark.MarkBook),2)>"+markStart+" and ROUND(avg(single_book_mark.MarkBook),2)<"+markEnd)
	
	
	try{
		connection.query("select count(*) as how from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%"+category+"\%' and book.yearPublish>"+yearsStartPublish+" and book.yearPublish<"+yearsEndPublish+" and writers.name like '\%"+authorsName+"\%' and writers.surname like '\%"+authorsSurname+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  having ROUND(avg(single_book_mark.MarkBook),2)>="+markStart+" and ROUND(avg(single_book_mark.MarkBook),2)<="+markEnd,function(err,res,x){
			if(res.length>0){
				response.setHeader('Content-Type','application/json')
			//	response.end(JSON.stringify({howMany:res[0].how}))		
			response.end(JSON.stringify({howMany:res.length}))	
		}else{
			response.end(JSON.stringify({howMany:res.length}))	
		}
	})
	
	
		}
		catch( x){
				showLogMessagge("Error:"+x)
		}
	
	
	
	})



app.get("/howManyBookWithOneCategory",function(request,response){
	let category=request.query.category
	
showLogMessagge("select count(*) as how from book INNER join gentre on gentre.IdGentre=book.IdGentre where gentre.DescriptionGentre like  '\%"+category+"\%'")
	
	
	try{
		connection.query("select count(*) as how from book INNER join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like   '\%"+category+"\%'",function(err,res,x){
			if(res.length>0){
				response.setHeader('Content-Type','application/json')
				response.end(JSON.stringify({howMany:res[0].how}))		
		}
	})
	
	
		}
		catch( x){
				showLogMessagge("Error:"+x)
		}
	
	
	
	})


app.get("/getBookWithOneCategoryWithFilter",function(request,response){
	let category=request.query.category
	let position=request.query.position
	let markStart=request.query.markStart
	let markEnd=request.query.markEnd
	let yearsStartPublish=request.query.yearsStartPublish
	let yearsEndPublish=request.query.yearsEndPublish
	let authorsName=request.query.authorsName
	let authorsSurname=request.query.authorsSurname

	showLogMessagge(category+" "+position+" "+markStart+" "+markEnd+" "+yearsStartPublish+" "+yearsEndPublish+" "+authorsName+" "+authorsSurname)

	showLogMessagge("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%"+category+"\%'  and book.yearPublish>="+yearsStartPublish +" and book.yearPublish<="+yearsEndPublish+" and writers.name like '\%"+authorsName+"\%' and writers.surname like '\%"+authorsSurname+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING ROUND(avg(single_book_mark.MarkBook),2) >="+markStart+" and ROUND(avg(single_book_mark.MarkBook),2) <="+markEnd+" limit "+position+" ,1")
try{
	connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%"+category+"\%'  and book.yearPublish>="+yearsStartPublish +" and book.yearPublish<="+yearsEndPublish+" and writers.name like '\%"+authorsName+"\%' and writers.surname like '\%"+authorsSurname+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING ROUND(avg(single_book_mark.MarkBook),2) >="+markStart+" and ROUND(avg(single_book_mark.MarkBook),2) <="+markEnd+" limit "+position+" ,1",function(err,res,x){
		if(res.length>0){
			response.setHeader('Content-Type','application/json')
			var markBookFinal=res[0].markBook
			showLogMessagge("Daję książkę o pozycji :"+position)
			if(markBookFinal==null){
				showLogMessagge("Jest null daje o")
				markBookFinal=0

			}
		    response.end(JSON.stringify({idBook:res[0].idBook,titleBook:res[0].titleBook,nameAuthor:res[0].nameAuthor+" "+res[0].surnameAuthor,markBook:markBookFinal,gentreBook:res[0].gentreBook,pageBook:res[0].page,yearPublish:res[0].year,descriptionBook:res[0].description,countMark:res[0].countMark,gentre_1:" ",gentre_2:" ",gentre_3:" ",gentre_4:" ",gentre_5:" ",gentre_6:" ",gentre_7:" ",gentre_8:" "}))		
	}
})


	}
	catch( x){
			showLogMessagge("Error:"+x)
	}



})


app.get("/getBookWithOneCategory",function(request,response){
let category=request.query.category
let position=request.query.position



showLogMessagge("Całe zapytanie:"+"select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentre on gentre.IdGentre=book.IdGentre where gentre.DescriptionGentre like '\%"+category+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  limit "+position+" ,1 ")
try{
	connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook inner join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentreandbook.idGentre=gentre.IdGentre where gentre.DescriptionGentre like   '\%"+category+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  limit "+position+" ,1 ",function(err,res,x){
		if(res.length>0){
			response.setHeader('Content-Type','application/json')
			var markBookFinal=res[0].markBook
			showLogMessagge("Daję książkę o pozycji :"+position)
			if(markBookFinal==null){
				showLogMessagge("Jest null daje o")
				markBookFinal=0

			}
		    response.end(JSON.stringify({idBook:res[0].idBook,titleBook:res[0].titleBook,nameAuthor:res[0].nameAuthor+" "+res[0].surnameAuthor,markBook:markBookFinal,gentreBook:res[0].gentreBook,pageBook:res[0].page,yearPublish:res[0].year,descriptionBook:res[0].description,countMark:res[0].countMark,gentre_1:" ",gentre_2:" ",gentre_3:" ",gentre_4:" ",gentre_5:" ",gentre_6:" ",gentre_7:" ",gentre_8:" "}))		
	}
})


	}
	catch( x){
			showLogMessagge("Error:"+x)
	}



})


app.get("/findBookHow",function(request,response){
	let position=request.query.positionBook
	let filter=request.query.filterBook

	connection.query("SELECt count(book.Idbook) as howMany  from book inner join writers on writers.IdWriters=book.IdAuthors where book.nameBook like '\%"+filter + "\%' limit "+position+",1",function(err,res){
			if(res.length>0){
				response.setHeader('Content-Type','application/json')
				response.end(JSON.stringify({howMany:res[0].howMany}))

			}


	})


})


app.get("/returnBookWithNameFilter",function(request,response){
	let position=request.query.positionBook
	let filter=request.query.filterBook

	showLogMessagge("Filtry")
	showLogMessagge("SELECt book.idBook as idBook,writers.name as author,writers.surname as sur,book.nameBook as nameBook  from book left outer join writers on writers.IdWriters=book.IdAuthors where book.nameBook like '\%"+filter + "\%' limit "+position+",1")
	connection.query("SELECt book.idBook as idBook,writers.name as author,writers.surname as sur,book.nameBook as nameBook  from book left outer join writers on writers.IdWriters=book.IdAuthors where book.nameBook like  '\%"+filter + "\%' order by idBook limit "+position+",1",function(err,res){
			if(res.length>0){
				response.setHeader('Content-Type','application/json')
				response.end(JSON.stringify({idBook:res[0].idBook,author:res[0].author,nameBook:res[0].nameBook,sur:res[0].sur}))

			}


	})
	



})

app.get("/giveBookWithOneCategory",function(request,response){
	let numberBooks=request.query.numberBook;
	let filter=request.query.filter
	let lowerValueMark=request.query.lowerValueMark
	let biggerValueMark=request.query.biggerValueMark
	let lowerValueYears=request.query.lowerValueYears
	let biggerValueYears=request.query.biggerValueYears
	let nameAuthors=request.query.nameAuthors
	
	let fullName=nameAuthors.split(" ");

	
	let firstName=""
	let secondName=""

	if(fullName[0]!=null && fullName[1]!=null){
		firstName=fullName[0]
		 secondName=fullName[1]
	}else if(fullName[0]!=null){
		
		 secondName=fullName[0]
	}

	showLogMessagge(firstName+"/"+secondName)

	showLogMessagge("Chcę książke o numerze"+numberBooks+" z kategorii "+filter+" Ocena: "+lowerValueMark+"/"+biggerValueMark+" Lata:"+lowerValueYears+"/"+biggerValueYears+" autor"+nameAuthors)
	showLogMessagge("Kurwa:select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%"+filter+"\%' and book.yearPublish>"+lowerValueYears+" and book.yearPublish<"+biggerValueYears+" and writers.name like '%%' and writers.surname like '%%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING ROUND(avg(single_book_mark.MarkBook),2) >"+lowerValueMark+" and ROUND(avg(single_book_mark.MarkBook),2)<"+biggerValueMark+" limit "+numberBooks+" ,1")

	try{
	connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%"+filter+"\%' and book.yearPublish>"+lowerValueYears+" and book.yearPublish<"+biggerValueYears+" and writers.name like '%%' and writers.surname like '%%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING ROUND(avg(single_book_mark.MarkBook),2) >="+lowerValueMark+" and ROUND(avg(single_book_mark.MarkBook),2)<="+biggerValueMark+" limit "+numberBooks+" ,1",function(err,res,x){
		if(res.length>0){


			connection.query("select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where book.idBook="+res[0].idBook,function(fgh,resp,ff){
				if(resp.length>0){
					let gentreBook=[" "," "," "," "," "," "," "," "," "]
					for(let i=0;i<resp.length;i++){
						showLogMessagge(resp[i].gentreBook)
						gentreBook[i]=resp[i].gentreBook
					}

					var markBookFinal=res[0].markBook
					if(markBookFinal==null){
						showLogMessagge("Jest null daje o")
						markBookFinal=0
		
					}
					response.setHeader('Content-Type','application/json')
		    response.end(JSON.stringify({idBook:res[0].idBook,titleBook:res[0].titleBook,nameAuthor:res[0].nameAuthor+" "+res[0].surnameAuthor,markBook:markBookFinal,gentreBook:res[0].gentreBook,pageBook:res[0].page,yearPublish:res[0].year,descriptionBook:res[0].description,countMark:res[0].countMark,gentre_1:gentreBook[0],gentre_2:gentreBook[1],gentre_3:gentreBook[2],gentre_4:gentreBook[3],gentre_5:gentreBook[4],gentre_6:gentreBook[5],gentre_7:gentreBook[6],gentre_8:gentreBook[7]}))		

				}
			})

			
			
	}
})


	}
	catch( x){
			showLogMessagge("Error:"+x)
	}
})






app.get("/giveSearchBook",function(request,response){
	let numberBooks=request.query.numberBook;
	let filter=request.query.filter
	showLogMessagge("Chcę książke o numerze"+numberBooks+" !!!")
	showLogMessagge("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentre on gentre.IdGentre=book.IdGentre where book.nameBook like '\%"+filter+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  limit "+numberBooks+" ,1 ")

	try{
	connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentre on gentre.IdGentre=book.IdGentre where book.nameBook like '\%"+filter+"\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by idBook limit "+numberBooks+" ,1 ",function(err,res,x){
		if(res.length>0){

			showLogMessagge("12:"+"select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where idBook="+res[0].idBook)
			connection.query("select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where book.idBook="+res[0].idBook,function(fgh,resp,ff){
				if(resp.length>0){
					let gentreBook=[" "," "," "," "," "," "," "," "," "]
					for(let i=0;i<resp.length;i++){
						showLogMessagge(resp[i].gentreBook)
						gentreBook[i]=resp[i].gentreBook
					}

					var markBookFinal=res[0].markBook
					if(markBookFinal==null){
						showLogMessagge("Jest null daje o")
						markBookFinal=0

					}

					response.end(JSON.stringify({idBook:res[0].idBook,titleBook:res[0].titleBook,nameAuthor:res[0].nameAuthor+" "+res[0].surnameAuthor,markBook:markBookFinal,gentreBook:res[0].gentreBook,pageBook:res[0].page,yearPublish:res[0].year,descriptionBook:res[0].description,countMark:res[0].countMark,gentre_1:gentreBook[0],gentre_2:gentreBook[1],gentre_3:gentreBook[2],gentre_4:gentreBook[3],gentre_5:gentreBook[4],gentre_6:gentreBook[5],gentre_7:gentreBook[6],gentre_8:gentreBook[7]}))		
					showLogMessagge("Wysąłłem odp")

				}
			})

			response.setHeader('Content-Type','application/json')
		
	}
})


	}
	catch( x){
			showLogMessagge("Error:"+x)
	}
})


app.get("/givePopularBook",function(request,response){
	let numberBooks=request.query.numberBook;
	showLogMessagge("Chcę książke o numerze Popularne:"+numberBooks)
	showLogMessagge("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentre on gentre.IdGentre=book.IdGentre group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by count(single_book_mark.IdBook) desc limit "+numberBooks+" ,1 ")

	try{
	connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentre on gentre.IdGentre=book.IdGentre group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by count(single_book_mark.IdBook) desc limit "+numberBooks+" ,1 ",function(err,res,x){
		if(res.length>0){
			


			connection.query("select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where book.idBook="+res[0].idBook,function(fgh,resp,ff){
				if(resp.length>0){
					let gentreBook=[" "," "," "," "," "," "," "," "," "]
					for(let i=0;i<resp.length;i++){
						showLogMessagge(resp[i].gentreBook)
						gentreBook[i]=resp[i].gentreBook
					}

					var markFinasl=res[0].markBook
					if(markFinasl==null){
						markFinasl=0
					}

					response.setHeader('Content-Type','application/json')
		    response.end(JSON.stringify({idBook:res[0].idBook,titleBook:res[0].titleBook,nameAuthor:res[0].nameAuthor+" "+res[0].surnameAuthor,markBook:markFinasl,gentreBook:res[0].gentreBook,pageBook:res[0].page,yearPublish:res[0].year,descriptionBook:res[0].description,countMark:res[0].countMark,gentre_1:gentreBook[0],gentre_2:gentreBook[1],gentre_3:gentreBook[2],gentre_4:gentreBook[3],gentre_5:gentreBook[4],gentre_6:gentreBook[5],gentre_7:gentreBook[6],gentre_8:gentreBook[7]}))		

				}
			})

			
	}
})


	}
	catch( x){
			showLogMessagge("Error:"+x)
	}
})



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