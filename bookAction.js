LOG = require("./log")

module.exports = function(app, connection) {

    app.post("/markBook", function(req, response) {
        let mark = req.body.mark
        let opinion = req.body.opinion
        let email = req.body.mail;
        let idBook = parseInt(req.body.idBook)

        let idUser = 0
        LOG.showLogMessagge("Ocenia książkę użytkownik o mailu :" + email + " ocena:" + mark)


        const FIND_USER_ABOUT_EMAIL_QUERY = connection.format("SELECT IdUser from user where EmailAdress=?", [email])

        try {

            connection.query(FIND_USER_ABOUT_EMAIL_QUERY, function(_, res, _) {
                if (res.length > 0) {
                    idUser = parseInt(res[0].IdUser)

                    const CHECK_IF_USER_YET_MARK_BOOK_QUERY = connection.format("Select * from single_book_mark where \
                    IdUser=? and IdBook=?", [idUser, idBook])

                    connection.query(CHECK_IF_USER_YET_MARK_BOOK_QUERY, function(er, res) {
                        if (res.length > 0) {

                            LOG.showLogMessagge("Zmiana oceny zapytanie ksiązki przez:" + email + " nowa ocena:" + mark)
                            const UPDATE_BOOK_MARK_QUERY = connection.format("UPDATE single_book_mark set MarkBook=?, UserOpinion=? where IdUser=? and IdBook=?", [mark, opinion, idUser, idBook])
                            LOG.showLogMessagge(UPDATE_BOOK_MARK_QUERY)

                            connection.query(UPDATE_BOOK_MARK_QUERY, function(_, _) {
                                response.setHeader('Content-Type', 'application/json')
                                response.end(JSON.stringify({
                                    good: "good"
                                }))

                            })

                        } else {
                            LOG.showLogMessagge("Ocena nowej ksiązki :" + mark + " Opinia :" + opinion + " email: " + email + " id:" + idUser + " id Ksiązki:" + idBook)

                            const INSERT_NEW_MARK_BOOK_QUERY = connection.format("INSERT into single_book_mark \
                    values(null,?,?,?,?) ", [idUser, mark, opinion, idBook])

                            connection.query(INSERT_NEW_MARK_BOOK_QUERY, function(_, _) {
                                response.setHeader('Content-Type', 'application/json')
                                response.end(JSON.stringify({
                                    good: "good"
                                }))

                            })

                        }
                    })


                }
            })

        } catch (err) {
            LOG.showLogMessagge("BLĄD :" + err)
        }



    })




    app.get("/getUsersMarkStatistics", function(request, response) {
        let idBook = parseInt(request.query.idBook)
        let markMap = new Map()
        markMap.set("1", "0")
        markMap.set("2", "0")
        markMap.set("3", "0")
        markMap.set("4", "0")
        markMap.set("5", "0")
        markMap.set("6", "0")
        markMap.set("7", "0")
        markMap.set("8", "0")
        markMap.set("9", "0")
        markMap.set("10", "0")

        const FIND_MARK_BOOKS_HOW_AND_QUANTITY_QUERY = connection.format("SELECT MarkBook as markId,count(IdUser) as quant FROM `single_book_mark` where IdBook=? group by MarkBook", [idBook])


        try{
        connection.query(FIND_MARK_BOOKS_HOW_AND_QUANTITY_QUERY, function(_, res, _) {
            response.setHeader('Content-Type', 'application/json')

            if (res.length > 0) {
                for (let one of res) {

                    markMap.set(one.markId.toString(), one.quant)

                }


            }


            response.end(JSON.stringify({
                mark_1: markMap.get("1"),
                mark_2: markMap.get("2"),
                mark_3: markMap.get("3"),
                mark_4: markMap.get("4"),
                mark_5: markMap.get("5"),
                mark_6: markMap.get("6"),
                mark_7: markMap.get("7"),
                mark_8: markMap.get("8"),
                mark_9: markMap.get("9"),
                mark_10: markMap.get("10"),
            }))


        })
    }
    catch(err){
        LOG.showLogMessagge(err)
    }
    })




    app.get("/returnUserBookMark", function(req, response) {

        let emailUser = req.query.email
        let idBook = parseInt(req.query.idBook)

        const FIND_USER_BOOK_MARK = connection.format("select single_book_mark.MarkBook as mark,single_book_mark.UserOpinion as opinion from user INNER join single_book_mark on single_book_mark.IdUser=user.IdUser where user.EmailAdress=? and single_book_mark.IdBook=?", [emailUser, idBook])

        try{
        connection.query(FIND_USER_BOOK_MARK, function(_, res, _) {
            response.setHeader('Content-Type', 'application/json')
            if (res.length > 0) {
                response.end(JSON.stringify({
                    mark: res[0].mark,
                    opinion: res[0].opinion + " "
                }))
            } else {
                response.end(JSON.stringify({
                    mark: -1,
                    opinion: "sztos" + " "
                }))
            }
        })
    }catch(err){
        LOG.showLogMessagge(err)
    }



    })




    app.get("/IfUserVotedBook", function(req, response) {

        let emailUser = req.query.email
        let idBook = parseInt(req.query.idBook)

        LOG.showLogMessagge("Czy user ocenił ksiżkę: " + emailUser + " idKsiązki:" + idBook)
        const CHECK_IF_USER_VOTED_BOOK_QUERY = connection.format("select *from user INNER join single_book_mark on single_book_mark.IdUser=user.IdUser where user.EmailAdress=? and  single_book_mark.IdBook=?", [emailUser, idBook])
        

        try{
        connection.query(CHECK_IF_USER_VOTED_BOOK_QUERY, function(_, res, _) {
            response.setHeader('Content-Type', 'application/json')
            if (res.length > 0) {
                LOG.showLogMessagge("TAK")
                response.end(JSON.stringify({
                    ifUserGiveMark: true
                }))
            } else {
                LOG.showLogMessagge("NIE")
                response.end(JSON.stringify({
                    ifUserGiveMark: false
                }))
            }
        })
    }catch(err){
        LOG.showLogMessagge(err)
    }



    })




    app.get("/HowManyBookAboutId", function(req, response) {

        let idBook = parseInt(req.query.idBook)



        const HOW_MANY_BOOK_ABOUT_ID_QUERY = connection.format("SELECT user.login as userName,single_book_mark.MarkBook as userMark,single_book_mark.UserOpinion as userOpinion,count(user.login) as howManyComments  FROM `book` inner join single_book_mark on single_book_mark.IdBook=book.idBook inner join user on user.IdUser=single_book_mark.IdUser where book.idBook=?", [idBook])


        try{
        connection.query(HOW_MANY_BOOK_ABOUT_ID_QUERY, function(_, res, _) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')

                response.end(JSON.stringify({
                    userName: res[0].userName,
                    userMark: res[0].userMark,
                    userOpinion: res[0].userOpinion,
                    howManyComments: res[0].howManyComments
                }))
            }


        })
    }catch(err){
        LOG.showLogMessagge(err)
    }
    })



    app.get("/getCommentBook", function(req, response) {
        let idBook = parseInt(req.query.idBook)
        let position = parseInt(req.query.position)
        LOG.showLogMessagge("Pokazuje komentarz ksiażki o id :" + idBook + " a pozycja:" + position)

        const GET_BOOK_COMMENT_ABOUT_NUMBER_QUERY = connection.format("SELECT user.login as userName,single_book_mark.MarkBook as userMark,single_book_mark.UserOpinion as userOpinion FROM `book` inner join single_book_mark on single_book_mark.IdBook=book.idBook inner join user on user.IdUser=single_book_mark.IdUser where book.idBook=? limit ? ,1", [idBook, position])


        try{
        connection.query(GET_BOOK_COMMENT_ABOUT_NUMBER_QUERY, function(_, res, _) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    userName: res[0].userName,
                    userMark: res[0].userMark,
                    userOpinion: res[0].userOpinion,
                    howManyComments: '1'
                }))
            }


        })
        }catch(err){
            LOG.showLogMessagge(err)
        }


    })



    app.get("/getImageBook", function(request, response) {
        let numberBook = request.query.numberBook;

        response.sendFile("C:\\BookWebServer\\img\\" + numberBook + ".jpg")

    })

    app.post("/deleteYoursMarkBook", function(request, response) {
        let idBook = parseInt(request.body.IdBook)
        let emailUser = request.body.emailUser
        LOG.showLogMessagge("Usuwam ocenę książki o id "+idBook+" użytkownika:"+emailUser)
       
        const FIND_USER_ID_QUERY=connection.format("SELECT user.IdUser as user FROM `single_book_mark` inner join user on user.IdUser=single_book_mark.IdUser where user.EmailAdress=? and single_book_mark.IdBook=?",[emailUser,idBook])


        try{
        connection.query(FIND_USER_ID_QUERY, function(_, res, _) {
            if (res.length > 0) {
                const DELETE_MARK_BOOK_QUERY=connection.format("Delete from single_book_mark where IdUser=? and IdBook=?" ,[res[0].user,idBook])
                connection.query(DELETE_MARK_BOOK_QUERY)
                response.end(JSON.stringify({
                    ok: "ok"
                }))
            }
        })
    }catch(err){
        LOG.showLogMessagge(err)
    }


    })




    app.get("/howManyBookWithOneCategoryFilter", function(request, response) {
        let category = request.query.category
        let markStart = parseInt(request.query.markStart)
        let markEnd = parseInt(request.query.markEnd)
        let yearsStartPublish = parseInt(request.query.yearsStartPublish)
        let yearsEndPublish = parseInt(request.query.yearsEndPublish)
        let authorsName = request.query.authorsName
        let authorsSurname = request.query.authorsSurname

        LOG.showLogMessagge("Wyświetlam książki z filtrem kategoria:"+category+" ocena Start:"+markStart+" ocena Stop:"+markEnd+
        " Początek publikacji:"+yearsEndPublish+" koniec:"+yearsEndPublish+" autor Imię:"+authorsName+" Nazwisko:"+authorsSurname)



        try {
            const SHOW_BOOK_FILTER_LIST_ABOUT_POSITION_QUERY=connection.format("select count(*) as how from book left outer join writers\
             on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join\
             gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on\
             gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre\
             like ? and book.yearPublish>=?  and\
             book.yearPublish<=? and writers.name like ? and \
             writers.surname like  ? group by\
             single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre \
             having IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0)>= ?\
             and IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0)<=?" ,[category,yearsStartPublish,yearsEndPublish,"%"+authorsName+"%",
             "%"+authorsSurname+"%",markStart,markEnd])
           
            connection.query(SHOW_BOOK_FILTER_LIST_ABOUT_POSITION_QUERY, function(_, res, _) {
                if (res.length > 0) {
                    response.setHeader('Content-Type', 'application/json')
                    response.end(JSON.stringify({
                        howMany: res.length
                    }))
                } else {
                    response.end(JSON.stringify({
                        howMany: res.length
                    }))
                }
            })


        } catch (x) {
            showLogMessagge("Error:" + x)
        }



    })



    app.get("/howManyBookWithOneCategory", function(request, response) {
        let category = request.query.category
        LOG.showLogMessagge("Wyświetlam książki z jednej kategorii:"+category)

        const HOW_MANY_BOOK_ONE_CATEGORY_QUERY=connection.format("select count(*) as how from book INNER join gentreandbook on \
        gentreandbook.idBook=book.idBook INNER join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre\
         like  ?",["%"+category+"%"])

        try {
            connection.query(HOW_MANY_BOOK_ONE_CATEGORY_QUERY, function(_, res, _) {
                if (res.length > 0) {
                    response.setHeader('Content-Type', 'application/json')
                    response.end(JSON.stringify({
                        howMany: res[0].how
                    }))
                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }



    })


    app.get("/giveTopBook", function(request, response) {
        let numberBooks = parseInt(request.query.numberBook)
    
        LOG.showLogMessagge("Zwracam książke z top"+numberBooks)


        try {

            const FIND_SEARCH_BOOK_ABOUT_POSITION=connection.format("select book.idBook as idBook,book.Description as description\
            ,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,\
            writers.surname as surnameAuthor ,count(single_book_mark.IdBook) as countMark,\
            ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book\
             left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on\
              single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook\
               left outer join gentre on gentre.IdGentre=gentreandbook.idGentre group by single_book_mark.IdBook,\
               book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by\
               ROUND(avg(single_book_mark.MarkBook),2) desc limit ?,1",[numberBooks])
            connection.query(FIND_SEARCH_BOOK_ABOUT_POSITION, function(_, res, _) {
                if (res.length > 0) {

                    const FIND_GENTRE_BOOK_QUERY=connection.format("select gentre.DescriptionGentre as gentreBook from book left outer join\
                     gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where \
                     book.idBook=?" ,[res[0].idBook])
                    connection.query(FIND_GENTRE_BOOK_QUERY, function(_, resp, _) {
                        if (resp.length > 0) {
                            let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                            for (let i = 0; i < resp.length; i++) {
                                
                                gentreBook[i] = resp[i].gentreBook
                            }

                            var markBookFinal = res[0].markBook
                            if (markBookFinal == null) {
                             
                                markBookFinal = 0

                            }


                            LOG.showLogMessagge("ksiązka  id :"+res[0].idBook+" nazwa:"+res[0].titleBook+" autor:"+res[0].nameAuthor+" "
                            +res[0].surnameAuthor+" ocena:"+res[0].markBookFinal+" strony:"+res[0].page+" rok powstania:"+res[0].yearPublish
                            +" opis:"+res[0].description+" ilość ocen:"+res[0].countMark+" gatunek:"+gentreBook[0]+" gatunek2:"+gentreBook[1]+
                            " gatunek3:"+gentreBook[2])
                            response.end(JSON.stringify({
                                idBook: res[0].idBook,
                                titleBook: res[0].titleBook,
                                nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                                markBook: markBookFinal,
                                gentreBook: res[0].gentreBook,
                                pageBook: res[0].page,
                                yearPublish: res[0].year,
                                descriptionBook: res[0].description,
                                countMark: res[0].countMark,
                                gentre_1: gentreBook[0],
                                gentre_2: gentreBook[1],
                                gentre_3: gentreBook[2],
                                gentre_4: gentreBook[3],
                                gentre_5: gentreBook[4],
                                gentre_6: gentreBook[5],
                                gentre_7: gentreBook[6],
                                gentre_8: gentreBook[7]
                            }))
                           

                        }
                    })

                    response.setHeader('Content-Type', 'application/json')

                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }
    })

    app.get("/getTopBook",function(request,response){
        
        let position=parseInt(request.query.position)
        LOG.showLogMessagge("Zwracam ranking książek pozycja:"+position)
        const CHOICE_TOP_BOOK_QUERY=connection.format("select book.idBook as idBook,book.Description as description\
         ,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,\
         writers.surname as surnameAuthor ,count(single_book_mark.IdBook) as countMark,\
         ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book\
          left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on\
           single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook\
            left outer join gentre on gentre.IdGentre=gentreandbook.idGentre group by single_book_mark.IdBook,\
            book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by\
            ROUND(avg(single_book_mark.MarkBook),2) desc limit ?,1",[position])

             try {
                connection.query(CHOICE_TOP_BOOK_QUERY, function(_, res, _) {
                    if (res.length > 0) {
                        response.setHeader('Content-Type', 'application/json')
                        var markBookFinal = res[0].markBook
                      
                        if (markBookFinal == null) {
                         
                            markBookFinal = 0
    
                        }
                        response.end(JSON.stringify({
                            idBook: res[0].idBook,
                            titleBook: res[0].titleBook,
                            nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                            markBook: markBookFinal,
                            gentreBook: res[0].gentreBook,
                            pageBook: res[0].page,
                            yearPublish: res[0].year,
                            descriptionBook: res[0].description,
                            countMark: res[0].countMark,
                            gentre_1: " ",
                            gentre_2: " ",
                            gentre_3: " ",
                            gentre_4: " ",
                            gentre_5: " ",
                            gentre_6: " ",
                            gentre_7: " ",
                            gentre_8: " "
                        }))
                    }
                })
    
    
            } catch (x) {
                LOG.showLogMessagge("Error:" + x)
            }


    })

    app.get("/getBookWithOneCategoryWithFilter", function(request, response) {
        let category = request.query.category
        let position = parseInt(request.query.position)
        let markStart = parseInt(request.query.markStart)
        let markEnd = parseInt(request.query.markEnd)
        let yearsStartPublish =parseInt( request.query.yearsStartPublish)
        let yearsEndPublish = parseInt(request.query.yearsEndPublish)
        let authorsName = request.query.authorsName
        let authorsSurname = request.query.authorsSurname

        LOG.showLogMessagge("Wyświetlam ksiązki z filtem kategoria:"+category + " pozycja:" + position + " ocena start:" + markStart + "ocena stop: " + markEnd + " rok start:" + yearsStartPublish + " rok koniec:" + yearsEndPublish + " autor imię:" + authorsName + " nazwisko:" + authorsSurname)

        const SHOIW_BOOK_LIST_WITH_FILTER_ABOUT_POSITION_QUERY=connection.format("select book.idBook as idBook,book.Description as description\
        ,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor\
        ,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook\
         from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook\
          left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where\
           gentre.DescriptionGentre like ?  and book.yearPublish>=? and book.yearPublish<=\
           ? and writers.name like ? and writers.surname like ? group by\
            single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING IFNULL(ROUND(avg(single_book_mark.MarkBook)\
            ,2),0) >=? and IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0) <=?  limit ? ,1",
            [category,yearsStartPublish,yearsEndPublish,"%"+authorsName+"%","%"+authorsSurname+"%",markStart,markEnd,position])
        try {
            connection.query(SHOIW_BOOK_LIST_WITH_FILTER_ABOUT_POSITION_QUERY, function(_, res, _) {
                if (res.length > 0) {
                    response.setHeader('Content-Type', 'application/json')
                    var markBookFinal = res[0].markBook
                  
                    if (markBookFinal == null) {
                     
                        markBookFinal = 0

                    }
                    response.end(JSON.stringify({
                        idBook: res[0].idBook,
                        titleBook: res[0].titleBook,
                        nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                        markBook: markBookFinal,
                        gentreBook: res[0].gentreBook,
                        pageBook: res[0].page,
                        yearPublish: res[0].year,
                        descriptionBook: res[0].description,
                        countMark: res[0].countMark,
                        gentre_1: " ",
                        gentre_2: " ",
                        gentre_3: " ",
                        gentre_4: " ",
                        gentre_5: " ",
                        gentre_6: " ",
                        gentre_7: " ",
                        gentre_8: " "
                    }))
                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }



    })


    app.get("/getBookWithOneCategory", function(request, response) {
        let category = request.query.category
        let position = parseInt(request.query.position)

        LOG.showLogMessagge("Zwracam ksiązkę z jednej kategorii:"+category)
        const RETURN_BOOK_WITH_ONE_CATEGORY_QUERY=connection.format("select book.idBook as idBook,book.Description as description,book.countPage\
         as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,\
         count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook\
         from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook\
         inner join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentreandbook.idGentre=gentre.IdGentre where \
         gentre.DescriptionGentre like   ? group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname\
         ,gentre.DescriptionGentre  limit ? ,1 ",["%"+category+"%",position])
 
        try {
            connection.query(RETURN_BOOK_WITH_ONE_CATEGORY_QUERY, function(_, res, _) {
                if (res.length > 0) {
                    response.setHeader('Content-Type', 'application/json')
                    var markBookFinal = res[0].markBook
                  
                    if (markBookFinal == null) {
                       
                        markBookFinal = 0

                    }
                    response.end(JSON.stringify({
                        idBook: res[0].idBook,
                        titleBook: res[0].titleBook,
                        nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                        markBook: markBookFinal,
                        gentreBook: res[0].gentreBook,
                        pageBook: res[0].page,
                        yearPublish: res[0].year,
                        descriptionBook: res[0].description,
                        countMark: res[0].countMark,
                        gentre_1: " ",
                        gentre_2: " ",
                        gentre_3: " ",
                        gentre_4: " ",
                        gentre_5: " ",
                        gentre_6: " ",
                        gentre_7: " ",
                        gentre_8: " "
                    }))
                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }



    })


    app.get("/findBookHow", function(request, response) {
        let position = parseInt(request.query.positionBook)
        let filter = request.query.filterBook

        LOG.showLogMessagge("Zwracam ile ksiązkek z filtrem nazwy :"+ filter)
        const HOW_MANY_BOOK_ABOUT_NAME_QUERY=connection.format("SELECt count(book.Idbook) as howMany  from book inner join writers on writers.IdWriters\
        =book.IdAuthors where book.nameBook like ? limit ?,1",["%"+filter+"%",position])
        LOG.showLogMessagge(HOW_MANY_BOOK_ABOUT_NAME_QUERY)

        try{

        connection.query(HOW_MANY_BOOK_ABOUT_NAME_QUERY, function(_, res) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')

                LOG.showLogMessagge("Ile:"+res[0].howMany)
                response.end(JSON.stringify({
                    howMany: res[0].howMany
                
                }))

            }


        })
    }catch(err){
        LOG.showLogMessagge(err)
    }



    })


    app.get("/returnBookWithNameFilter", function(request, response) {
        let position = parseInt(request.query.positionBook)
        let filter = request.query.filterBook
        LOG.showLogMessagge("Zwracam książke z filtrem nazwy :"+filter+" o pozycji:"+position)

        const RETURN_BOOKS_WITH_NAME_FILTER_ABOUT_POSITION_QUERY=connection.format("SELECt book.idBook as idBook,writers.name as\
         author,writers.surname as sur,book.nameBook as nameBook  from book left outer join writers on writers.IdWriters=book.IdAuthors\
         where book.nameBook like  ? order by idBook limit ?,1",
         ["%"+filter+"%",position])

         try{
        
        connection.query(RETURN_BOOKS_WITH_NAME_FILTER_ABOUT_POSITION_QUERY, function(_, res) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    idBook: res[0].idBook,
                    author: res[0].author,
                    nameBook: res[0].nameBook,
                    sur: res[0].sur
                }))

            }


        })
    }catch(err){
        LOG.showLogMessagge(err)
    }





    })



    app.get("/giveBookWithOneUserRead", function(request, response) {
        let numberBooks =parseInt( request.query.numberBook)
        let userEmail = request.query.userEmail

        LOG.showLogMessagge("Zwracam ksiązkę przeczytaną przez :"+userEmail+" o numerze:"+numberBooks)

        try {
            const RETURN_READ_BOOKS_BY_USER_ABOUT_POSITION=connection.format("select book.idBook as idBook,book.Description as description,book.countPage\
             as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,\
             count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook \
             from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook\
             left outer join gentreandbook on gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre INNER join user\
             on single_book_mark.IdUser=user.IdUser where user.EmailAdress=? group by single_book_mark.IdBook,book.nameBook,writers.name\
             ,writers.surname,gentre.DescriptionGentre order by  single_book_mark.markBook desc,book.nameBook desc,book.idBook desc limit\
             ? ,1",[userEmail,numberBooks])
            connection.query(RETURN_READ_BOOKS_BY_USER_ABOUT_POSITION, function(_, res, _) {
                if (res.length > 0) {

                    const RETURN_GENTRE_BOOK_QUERY=connection.format("select gentre.DescriptionGentre as gentreBook from book left outer\
                     join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre\
                     where book.idBook=?",[ res[0].idBook])

                    connection.query(RETURN_GENTRE_BOOK_QUERY, function(_, resp, _) {
                        if (resp.length > 0) {
                            let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                            for (let i = 0; i < resp.length; i++) {
                                
                                gentreBook[i] = resp[i].gentreBook
                            }

                            var markBookFinal = res[0].markBook
                            if (markBookFinal == null) {
                              
                                markBookFinal = 0

                            }

                            LOG.showLogMessagge("ksiązka  id :"+res[0].idBook+" nazwa:"+res[0].titleBook+" autor:"+res[0].nameAuthor+" "
                            +res[0].surnameAuthor+" ocena:"+res[0].markBookFinal+" strony:"+res[0].page+" rok powstania:"+res[0].yearPublish
                            +" opis:"+res[0].description+" ilość ocen:"+res[0].countMark+" gatunek:"+gentreBook[0]+" gatunek2:"+gentreBook[1]+
                            " gatunek3:"+gentreBook[2])
                            response.setHeader('Content-Type', 'application/json')
                            response.end(JSON.stringify({
                                idBook: res[0].idBook,
                                titleBook: res[0].titleBook,
                                nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                                markBook: markBookFinal,
                                gentreBook: res[0].gentreBook,
                                pageBook: res[0].page,
                                yearPublish: res[0].year,
                                descriptionBook: res[0].description,
                                countMark: res[0].countMark,
                                gentre_1: gentreBook[0],
                                gentre_2: gentreBook[1],
                                gentre_3: gentreBook[2],
                                gentre_4: gentreBook[3],
                                gentre_5: gentreBook[4],
                                gentre_6: gentreBook[5],
                                gentre_7: gentreBook[6],
                                gentre_8: gentreBook[7]
                            }))

                        }
                    })



                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }
    })

    app.get("/giveBookWithOneCategory", function(request, response) {
        let numberBooks = parseInt(request.query.numberBook)
        let filter = request.query.filter
        let lowerValueMark = parseInt(request.query.lowerValueMark)
        let biggerValueMark = parseInt(request.query.biggerValueMark)
        let lowerValueYears = parseInt(request.query.lowerValueYears)
        let biggerValueYears = parseInt(request.query.biggerValueYears)
        let nameAuthors = request.query.nameAuthors

        let fullName = nameAuthors.split(" ");


        let firstName = ""
        let secondName = ""

        if (fullName[0] != null && fullName[1] != null) {
            firstName = fullName[0]
            secondName = fullName[1]
        } else if (fullName[0] != null) {

            secondName = fullName[0]
        }

       LOG.showLogMessagge("Zwracam książkę filtry autor:"+nameAuthors+" gatunek:"+filter+" ocena min:"+lowerValueMark+" max:"+biggerValueMark
       +" rok początek:"+lowerValueYears+" koniec:"+biggerValueYears)

        try {

            const GET_BOOK_WITH_FILTER_QUERY=connection.format("select book.idBook as idBook,book.Description as description,book.countPage as page\
            ,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook)\
            as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on\
            book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on\
            gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre\
            like ? and book.yearPublish>= ? and book.yearPublish<=? and writers.name\
            like ? and writers.surname like ? group by single_book_mark.IdBook,book.nameBook,writers.name\
            ,writers.surname,gentre.DescriptionGentre HAVING ROUND(IFNULL(avg(single_book_mark.MarkBook),1),2) >=? and\
            ROUND(IFNULL(avg(single_book_mark.MarkBook),1),2)<=? limit ? ,1",["%"+filter+"%",lowerValueYears,biggerValueYears,
            "%"+firstName+"%","%"+secondName+"%",lowerValueMark,biggerValueMark,numberBooks])
            connection.query(GET_BOOK_WITH_FILTER_QUERY, function(_, res, _) {
                if (res.length > 0) {

                    const GET_GENTRE_BOOK_QUERY=connection.format("select gentre.DescriptionGentre as gentreBook from book left outer join\
                     gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where\
                      book.idBook=?",[res[0].idBook])

                    connection.query(GET_GENTRE_BOOK_QUERY, function(_, resp, _) {
                        if (resp.length > 0) {
                            let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                            for (let i = 0; i < resp.length; i++) {
                               
                                gentreBook[i] = resp[i].gentreBook
                            }

                            var markBookFinal = res[0].markBook
                            if (markBookFinal == null) {
                                markBookFinal = 0

                            }
                            response.setHeader('Content-Type', 'application/json')
                            LOG.showLogMessagge("ksiązka  id :"+res[0].idBook+" nazwa:"+res[0].titleBook+" autor:"+res[0].nameAuthor+" "
                            +res[0].surnameAuthor+" ocena:"+res[0].markBookFinal+" strony:"+res[0].page+" rok powstania:"+res[0].yearPublish
                            +" opis:"+res[0].description+" ilość ocen:"+res[0].countMark+" gatunek:"+gentreBook[0]+" gatunek2:"+gentreBook[1]+
                            " gatunek3:"+gentreBook[2])
                            response.end(JSON.stringify({
                                idBook: res[0].idBook,
                                titleBook: res[0].titleBook,
                                nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                                markBook: markBookFinal,
                                gentreBook: res[0].gentreBook,
                                pageBook: res[0].page,
                                yearPublish: res[0].year,
                                descriptionBook: res[0].description,
                                countMark: res[0].countMark,
                                gentre_1: gentreBook[0],
                                gentre_2: gentreBook[1],
                                gentre_3: gentreBook[2],
                                gentre_4: gentreBook[3],
                                gentre_5: gentreBook[4],
                                gentre_6: gentreBook[5],
                                gentre_7: gentreBook[6],
                                gentre_8: gentreBook[7]
                            }))

                        }
                    })



                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }
    })




    app.get("/giveSearchBook", function(request, response) {
        let numberBooks = parseInt(request.query.numberBook)
        let filter = request.query.filter
        LOG.showLogMessagge("Zwracam szukaną ksiązkę z filtrem:"+filter+" o pozycji:"+numberBooks)


        try {

            const FIND_SEARCH_BOOK_ABOUT_POSITION=connection.format("select book.idBook as idBook,book.Description as description,book.countPage as\
             page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor\
             ,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook\
             ,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters\
              left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentre on gentre.IdGentre=book.IdGentre\
             where book.nameBook like ? group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,\
             gentre.DescriptionGentre order by idBook limit ? ,1 ",["%"+filter+"%",numberBooks])
            connection.query(FIND_SEARCH_BOOK_ABOUT_POSITION, function(_, res, _) {
                if (res.length > 0) {

                    const FIND_GENTRE_BOOK_QUERY=connection.format("select gentre.DescriptionGentre as gentreBook from book left outer join\
                     gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where \
                     book.idBook=?" ,[res[0].idBook])
                    connection.query(FIND_GENTRE_BOOK_QUERY, function(_, resp, _) {
                        if (resp.length > 0) {
                            let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                            for (let i = 0; i < resp.length; i++) {
                                
                                gentreBook[i] = resp[i].gentreBook
                            }

                            var markBookFinal = res[0].markBook
                            if (markBookFinal == null) {
                             
                                markBookFinal = 0

                            }


                            LOG.showLogMessagge("ksiązka  id :"+res[0].idBook+" nazwa:"+res[0].titleBook+" autor:"+res[0].nameAuthor+" "
                            +res[0].surnameAuthor+" ocena:"+res[0].markBookFinal+" strony:"+res[0].page+" rok powstania:"+res[0].yearPublish
                            +" opis:"+res[0].description+" ilość ocen:"+res[0].countMark+" gatunek:"+gentreBook[0]+" gatunek2:"+gentreBook[1]+
                            " gatunek3:"+gentreBook[2])
                            response.end(JSON.stringify({
                                idBook: res[0].idBook,
                                titleBook: res[0].titleBook,
                                nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                                markBook: markBookFinal,
                                gentreBook: res[0].gentreBook,
                                pageBook: res[0].page,
                                yearPublish: res[0].year,
                                descriptionBook: res[0].description,
                                countMark: res[0].countMark,
                                gentre_1: gentreBook[0],
                                gentre_2: gentreBook[1],
                                gentre_3: gentreBook[2],
                                gentre_4: gentreBook[3],
                                gentre_5: gentreBook[4],
                                gentre_6: gentreBook[5],
                                gentre_7: gentreBook[6],
                                gentre_8: gentreBook[7]
                            }))
                           

                        }
                    })

                    response.setHeader('Content-Type', 'application/json')

                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }
    })


    app.get("/givePopularBook", function(request, response) {
        let numberBooks = parseInt(request.query.numberBook)
        LOG.showLogMessagge("Zwracam ksiązkę o nr popularnośći :"+numberBooks)

        const RETURN_POPULAR_BOOK_ABOUT_POSITION_QUERY=connection.format("select book.idBook as idBook,book.Description as description,book.countPage\
         as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,\
         count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from\
         book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook\
         INNER join gentre on gentre.IdGentre=book.IdGentre group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,\
         gentre.DescriptionGentre order by count(single_book_mark.IdBook) desc limit  ? ,1 ",[numberBooks])

         LOG.showLogMessagge(RETURN_POPULAR_BOOK_ABOUT_POSITION_QUERY)

        try {
            connection.query(RETURN_POPULAR_BOOK_ABOUT_POSITION_QUERY, function(_, res, _) {
                if (res.length > 0) {

                    const GET_GENTRE_BOOK_QUERY=connection.format("select gentre.DescriptionGentre as gentreBook from book left outer join \
                    gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where\
                     book.idBook=?" ,[res[0].idBook])

                    connection.query(GET_GENTRE_BOOK_QUERY, function(_, resp, _) {
                        if (resp.length > 0) {
                            let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                            for (let i = 0; i < resp.length; i++) {
                               
                                gentreBook[i] = resp[i].gentreBook
                            }

                            var markFinasl = res[0].markBook
                            if (markFinasl == null) {
                                markFinasl = 0
                            }


                            LOG.showLogMessagge("ksiązka  id :"+res[0].idBook+" nazwa:"+res[0].titleBook+" autor:"+res[0].nameAuthor+" "
                            +res[0].surnameAuthor+" ocena:"+res[0].markBookFinal+" strony:"+res[0].page+" rok powstania:"+res[0].yearPublish
                            +" opis:"+res[0].description+" ilość ocen:"+res[0].countMark+" gatunek:"+gentreBook[0]+" gatunek2:"+gentreBook[1]+
                            " gatunek3:"+gentreBook[2])
                            response.setHeader('Content-Type', 'application/json')
                            response.end(JSON.stringify({
                                idBook: res[0].idBook,
                                titleBook: res[0].titleBook,
                                nameAuthor: res[0].nameAuthor + " " + res[0].surnameAuthor,
                                markBook: markFinasl,
                                gentreBook: res[0].gentreBook,
                                pageBook: res[0].page,
                                yearPublish: res[0].year,
                                descriptionBook: res[0].description,
                                countMark: res[0].countMark,
                                gentre_1: gentreBook[0],
                                gentre_2: gentreBook[1],
                                gentre_3: gentreBook[2],
                                gentre_4: gentreBook[3],
                                gentre_5: gentreBook[4],
                                gentre_6: gentreBook[5],
                                gentre_7: gentreBook[6],
                                gentre_8: gentreBook[7]
                            }))

                        }
                    })


                }
            })


        } catch (x) {
            LOG.showLogMessagge("Error:" + x)
        }
    })




}