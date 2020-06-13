LOG=require("./log")

module.exports = function (app,connection) {
    app.get("/getBookWhichUserRead",function(request,response){
        let position=parseInt(request.query.position)
        let userEmail=request.query.userEmail
        LOG.showLogMessagge("Zwróc przeczytaną ksiażkę użytkownika :"+userEmail+" o pozycji książki :"+position)
        
        const GET_READ_BOOK_USER_ABOUT_POSITION_QUERY = connection.format("SELECT DISTINCT book.nameBook as nameBook,writers.name as nameWriters,book.idBook as\
        IdBook,writers.surname as surnameWriters,single_book_mark.MarkBook as userMark from user inner join single_book_mark on\
         single_book_mark.IdUser=user.IdUser inner join book on book.idBook=single_book_mark.IdBook inner join writers on writers.IdWriters\
        =book.IdAuthors where user.EmailAdress=? order by  single_book_mark.markBook desc,book.nameBook desc,book.idBook desc limit ? ,1", [userEmail,position]);
       
    
        try{
    
            connection.query(GET_READ_BOOK_USER_ABOUT_POSITION_QUERY,function(_,res,_){
                    response.setHeader('Content-Type','application/json')
                    response.end(JSON.stringify({nameBook :res[0].nameBook,nameWriters:res[0].nameWriters,surnameWriters:res[0].surnameWriters,userMark:res[0].userMark,IdBook:res[0].IdBook}))
            })


        }catch(err){
            console.error(err)
         
        }
    
    
    
    
      })






      app.get("/howManyBookReaduser",function(request,response){
        let userEmail=request.query.userEmail
        LOG.showLogMessagge("Ile ksiązek przeczytał użytkownik :"+userEmail)
    
    
        const HOW_MANY_READ_BOOK_USER_QUERY=connection.format("SELECT count(book.nameBook) as howReadBook,writers.name as nameWriters\
        ,book.idBook as IdBook,writers.surname as surnameWriters,single_book_mark.MarkBook as userMark from user inner join\
         single_book_mark on single_book_mark.IdUser=user.IdUser\
         inner join book on book.idBook=single_book_mark.IdBook inner join writers on writers.IdWriters=book.IdAuthors \
         where user.EmailAdress=? order by  single_book_mark.markBook desc,book.nameBook desc ",[userEmail])
    
         try{
             connection.query(HOW_MANY_READ_BOOK_USER_QUERY,function(_,res,_){
                response.setHeader('Content-Type','application/json')
                LOG.showLogMessagge("Użytkownik przeczytał: "+res[0].howReadBook+" książek")
                response.end(JSON.stringify({bookRead:res[0].howReadBook}))
            })

      }catch(err){
            console.error(err)
      }
    
    
      })


      app.get("/getUserImageProfile",function(request,response){
        let userEmail=request.query.userEmail
        LOG.showLogMessagge("Pobieram zdjęcie użytkownika :"+userEmail)
    
        const fs = require('fs')
        const PATH_USER_PROFILE_IMAGE = 'C:\\BookWebServer\\userImg\\'+userEmail+".jpg"
        const DEFAULT_PROFILE_IMAGE="C:\\BookWebServer\\userImg\\blazej.jpg"
    
        try {
          if (fs.existsSync(PATH_USER_PROFILE_IMAGE)) {
            response.sendFile(PATH_USER_PROFILE_IMAGE)
            
          }else{
            response.sendFile(DEFAULT_PROFILE_IMAGE)
          }
        } catch(err) {
              console.error(err)
        }
    
    
    
    
      })


      app.get("/getUserDataSettings",function(request,response){
        let userEmail=request.query.userEmail

        const USER_INFORMATION_STATISTICS_QUERY=connection.format("SELECT user.Login as login,sum(book.countPage) as readPage,count(*)\
         as readBook,avg(single_book_mark.MarkBook) as avgMark FROM `user` inner join single_book_mark on single_book_mark.IdUser=user.IdUser\
          inner join book on book.idBook=single_book_mark.IdBook WHERE EmailAdress=?",[userEmail])

        try{
       
          connection.query(USER_INFORMATION_STATISTICS_QUERY,function(_,res,_){
              if(res.length>0){
                  LOG.showLogMessagge("Zwracam statystyki użytkownika: "+userEmail+" ,przeczytane strony:"+res[0].readPage+","+
                  " książki:"+res[0].readBook+" ,średnia ocena:"+res[0].avgMark)

                  response.setHeader('Content-Type','application/json')
                  response.end(JSON.stringify({login :res[0].login,readPage:res[0].readPage,readBook:res[0].readBook,avgMark:res[0].avgMark}))
              }	
    
         })


      }catch(err){
        console.error(err)
      }
    
    
    
    })



}

