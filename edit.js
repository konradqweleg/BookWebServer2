var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}



var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());




const fs=require('fs')


    
function setCharAt(str,index,chr){
if(index>str.length-1) return str;
return str.substr(0,index)+chr+str.substr(index+1)
}

app.get("/dawaj",function(request,resposne){

    let idKsiazki=request.query.id
    try{
        var tytul=""
        var iloscStron=0
        var RokPowstania=0
        var ImieINazwiskoAutora=""
        var Opis=""
        console.log(idKsiazki+"xxxxxxxxxxxxxxxx")
        const data=fs.readFileSync(idKsiazki+'.txt','UTF-8')
        const lines=data.split(/\r?\n/)
        tytul=lines[0]
        console.log("Tytuł:"+tytul)
        iloscStron=lines[1].slice(0,5)
        console.log("Ilość stron:"+iloscStron)
    
    
        RokPowstania=lines[2]
        console.log("Rok:"+RokPowstania)
        ImieINazwiskoAutora=lines[3]
        console.log("Imię i Nazwisko:"+ImieINazwiskoAutora)
    
    
        var x=0
        lines.forEach((line)=>{
            if(x<4){
    x+=1
            }else{
                Opis+=line
            }
         //   console.log(line)
        })
    console.log("Opis:"+Opis)
    
    }catch(err){
        console.error(err)
    }
    
    
    var imieAutora=ImieINazwiskoAutora.split(" ")[0]
    var nazwiskoAutora=ImieINazwiskoAutora.split(" ")[1]
    
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'bookwebdatabase'
    });
    
    Opis=connection.escape(Opis)
    



   // if(Opis[0]=="'"){
        
     //   console.log("zamiana")
     //   setCharAt(Opis,0,'"')
     //   setCharAt(Opis,1,'')
    //    setCharAt(Opis,Opis.length-1,'"')
     //   setCharAt(Opis,Opis.length-2,'')
       
  //  }
    //Opis.replaceAt()
    console.log(Opis)
    console.log(imieAutora+" | "+nazwiskoAutora)
        console.log("select * from book where nameBook='"+tytul+"'")
        connection.query("select * from book where nameBook='"+tytul+"'",function(err,ii,x){
            if(ii.length>0){
                resposne.send("xx")
            }else{
    
                connection.query("Select * from writers where name=? and surname=?",[imieAutora,nazwiskoAutora],function(err,res,fie){
                    if(res.length>0){
                        console.log("Jest taki autor w bazie ma id:"+res[0].IdWriters)
                        console.log("Id ksiażki:"+idKsiazki)
                        
                        connection.query("Insert into book values("+idKsiazki+","+res[0].IdWriters+",1,"+Opis+",null,"+iloscStron+",'"+tytul+"',"+RokPowstania+")")
                        connection.query("Insert into  gentreandbook values ("+"null"+","+idKsiazki+",1)")
                        connection.end()
                        resposne.send("xx")
                        
                    
                
                    }else{
                        console.log("Nie ma takiego pisarza dodaję:"+ImieINazwiskoAutora)
                        connection.query("Insert into writers values(null,'"+imieAutora+"','"+nazwiskoAutora+"')")
                
                        connection.query("Select * from writers where name=? and surname=?",[imieAutora,nazwiskoAutora],function(err,res,fie){
                
                            console.log("Dodany autor ma Id:"+res[0].IdWriters)
                            
                            connection.query("Insert into book values("+idKsiazki+","+res[0].IdWriters+",1,"+Opis+",null,"+iloscStron+",'"+tytul+"',"+RokPowstania+")")
                            connection.query("Insert into  gentreandbook values ("+"null"+","+idKsiazki+",1)")
                                connection.end()
                                resposne.send("xx")
                               
                
                        })
                        
                
                    }
                
                })
    
            }
        })
        
        
    
    
    
    




})
app.listen(3200);