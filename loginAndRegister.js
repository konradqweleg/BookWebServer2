LOG=require("./log")

module.exports = function (app,connection) {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'konradnrog@gmail.com',
          pass: 'Windows10!47'
        }
      });

    Date.prototype.addHours=function(h){
        this.setTime(this.getTime()+(h*60*60*1000))
        return this
    }
  
    function addResetPasswordCodeToPasswordResetTable(email,code){
        LOG.showLogMessagge("Resetuje hasło użytkownika :"+email+" kod werfikacyjny to:"+code)  
    
        const FIND_USER_ABOUT_THIS_MAIL_QUERY="Select * from user where EmailAdress=?"
    
        const DELETE_PASSWORD_RESET_CODE_FROM_DATABASE_QUERY="DELETE FROM password_reset where IdUser=?"
    
        const INSERT_PASWORD_RESET_CODE_TO_DATABSE_QUERY="INSERT INTO password_reset values(null,"

        try{
        
         connection.query(FIND_USER_ABOUT_THIS_MAIL_QUERY,[email],function(err,res,fie){
                   if(res.length>0){
                
                        connection.query(DELETE_PASSWORD_RESET_CODE_FROM_DATABASE_QUERY,[res[0].IdUser],function(err,res){
                        if(err) throw err;
                    
                  })		
    
    
                    futureExpireDateCode=new Date().addHours(2)
                
                    connection.query(INSERT_PASWORD_RESET_CODE_TO_DATABSE_QUERY+res[0].IdUser+",\'"+code+"\',\'"+ futureExpireDateCode.getFullYear()+"-"+(futureExpireDateCode.getMonth()+1)+"="+futureExpireDateCode.getDate()+"-"+futureExpireDateCode.getHours()+"-"+futureExpireDateCode.getMinutes()+"-"+futureExpireDateCode.getSeconds()+"\'"+")",function(err,res){
                        if(err) throw err;
            
        
            
                 })
                
    
    
                }   
    
            })
        }catch(err){
            console.error(err)
        }

    
    
    
      }

      app.get("/checkIfAccountExsistAndSendOnMailResetPasswordCode",function(request,response){

        let email=request.query.mail
        LOG.showLogMessagge("Próba resetu hasła przez:"+email)
        let isAccountExist=false
        const FIND_USER_ABOUT_MAIL_QUERY=connection.fomat("Select * from user where EmailAdress=?",[email])

        try{
         connection.query(FIND_USER_ABOUT_MAIL_QUERY,function(_,res,_){
                if(res.length>0){
                    isAccountExist=true
                    passwordResetCode=randomCodeValityRegister(res[0].Login)
                    sendMailPasswordResetCode(passwordResetCode,email)
                    LOG.showLogMessagge("Wysyłam kod resetu hasła do:"+email)
                    addResetPasswordCodeToPasswordResetTable(email,passwordResetCode)
                    response.setHeader('Content-Type','application/json')
                    response.end(JSON.stringify({emailInDatabase:isAccountExist}))
                
                
    
    
                }else{
                    response.setHeader('Content-Type','application/json')
                    response.end(JSON.stringify({emailInDatabase:isAccountExist}))
    
             }
    
            })

    }catch(err){
        console.error(err)
    }
    
        
        
    
    })




    app.get("/registerUserCodeVerify",function(request,resposne){
        let code=request.query.code;
    
        LOG.showLogMessagge("Użytkownik użył kodu aktywującego konto")
        let passwordCopy="";
        let emailCopy="";
        let loginCopy="";

        const CHECK_USER_VALID_CODE_RESET_PASSWORD_QUERY=connection.format("Select * from user_no_verify where validCode=?",[code])
        
        try{
          connection.query(CHECK_USER_VALID_CODE_RESET_PASSWORD_QUERY,function(_,res,_){
            if(res.length>0){
                
                passwordCopy=res[0].password;
                loginCopy=res[0].login;
                emailCopy=res[0].email;
                LOG.showLogMessagge("Użytkownik:"+loginCopy)
                
    
                //wHAT IS THIS ?     to nie ma sensu 
                connection.query("DELETE FROM user where login=\'"+loginCopy+"\' or EmailAdress=\'"+emailCopy+"\'",function(err,res){
                    if(err) throw err;
                    
                })

                
                const DELETE_FROM_NO_VERIFY_USER_QUERY=connection.format("DELETE FROM user_no_verify where login=? or email=?",[loginCopy,emailCopy])
                connection.query(DELETE_FROM_NO_VERIFY_USER_QUERY,function(err,_){
                    if(err) throw err;
                    
                })
    
                const ADD_NEW_USER_ACCOUNT_TO_DATABASE_QUERY=connection.fomat("INSERT INTO user values(null,?,?,?,?)",[emailCopy,passwordCopy,loginCopy,1])
                connection.query(ADD_NEW_USER_ACCOUNT_TO_DATABASE_QUERY,function(err,_){
                    if(err) throw err;
                
                    LOG.showLogMessagge("Utworzono konto nowego użytkownika :"+emailCopy)
                })
            
    
                
    
            }
    
    
        })

    }catch(err){
        console.error(err)
    }
    
        resposne.setHeader('Content-Type','application/json')
        resposne.end(JSON.stringify({send:true}))
    
    
    })


    app.post("/changePassword",function(request,response){
        let code=request.body.code;
        let newPassword=request.body.newPassword;
        let passwordHash = require('password-hash');
        newPassword = passwordHash.generate(newPassword);
        LOG.showLogMessagge("Zmieniam hasło kod:"+code+ "nowe hasło:"+newPassword)

        const FIND_USER_WHICH_CHANGE_PASSWORD_QUERY=connection.format("Select * from password_reset where CodePasswordReset=?",[code])
        

        try{
        connection.query(FIND_USER_WHICH_CHANGE_PASSWORD_QUERY,function(_,res,_){
            if(res.length>0){

                const CHANGE_PASSWORD_USER_QUERY=connection.format("Update user set Password=? where idUser=?",[newPassword,res[0].IdUser])
                connection.query(CHANGE_PASSWORD_USER_QUERY,function(_,_,_){
                    LOG.showLogMessagge("Zmiana hasła udana użytkownika o id"+res[0].IdUser)
                    DELETE_USER_DATA_FROM_PASSWORD_RESET_TABLE="DELETE FROM password_reset where CodePasswordReset=?",[code]

                    connection.query(DELETE_USER_DATA_FROM_PASSWORD_RESET_TABLE,function(err,_){
                        if(err) throw err;
                        response.setHeader('Content-Type','application/json')
                        response.end(JSON.stringify({isGoodChangePassword:true}))
                    })
                })
            }
        })
        
    }catch(err){
        console.error(err)
    }
        
        
        
        
        
        })



        app.post("/checkAvailableEmailAndLogin",function(request,response){
            let userEmail=request.body.email
            let userLogin=request.body.login
            
            
            LOG.showLogMessagge("Sprawdzam czy dostępny jest mail:"+userEmail+" i login:"+userLogin)
            
            let ifEmailInDatabase=false
            let ifLoginInDatabase=false
            
            const CHECK_IF_USER_EMAIL_OR_LOGIN_AVAILABLE_QUERY= connection.format("Select * from user where EmailAdress=? or Login=?",[userEmail,userLogin])

        try{
            connection.query(CHECK_IF_USER_EMAIL_OR_LOGIN_AVAILABLE_QUERY,function(_,res,_){
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
                        LOG.showLogMessagge("Dostępny login :"+userLogin+" i email:"+userEmail)
                }else{
                    if(ifEmailInDatabase){
                        LOG.showLogMessagge("Email:"+userEmail+" jest zajęty")
                    }
            
                    if(ifLoginInDatabase){
                        LOG.showLogMessagge("Login:"+userLogin+" jest zajęty")
                    }
            
            
                }
                        
                response.setHeader('Content-Type','application/json')
                response.end(JSON.stringify({isLoginAvailability:!ifLoginInDatabase,isEmailAvailability:!ifEmailInDatabase}))
            
            })
        }catch(err){
            console.error(err)
        }
        
        
        })
            
            
            function randomCodeValityRegister(loginUser){
                var validCode=""
                for(i=0;i<7;++i){
                validCode+=randomInt(1,10)
                }
            
                LOG.showLogMessagge("Wygenerowany kod logowania to: "+loginUser+validCode)
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
                    LOG.showLogMessagge("Błąd wysłania e-maila "+error)
                    } else {
                     LOG.showLogMessagge("Mail wysłany")
                    }
                  });
            
            
            }
            
            
            function sendMailWithVerificationCode(code,destinationEmailAdress){
                
                LOG.showLogMessagge("Wysyłam maila z kodem aktywacyjnym na adres:"+destinationEmailAdress)
            
                 var mailOptions = {
                  from: 'konradnrog@gmail.com',
                  to: destinationEmailAdress,
                  subject: 'BookWeb activation link',
                  html: "<a target='_blank' href=\"http://176.111.31.64:3000/registerUserCodeVerify?code="+code+"\"> Aktywuj konto </a>"
                  };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                   LOG.showLogMessagge("Błąd wysłania e-maila "+error)
                } else {
                    LOG.showLogMessagge("Mail wysłany")
                }
              });
            
            }


}