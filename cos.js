var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');



var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bookwebdatabase'
});

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});


IS_LOG_SHOW = true




function showLogMessagge(message) {

    if (IS_LOG_SHOW)
        console.log(message)

}


require('./profilUser')(app, connection);
require("./loginAndRegister")(app, connection)
require("./bookAction")(app, connection)




app.get("/HowManyBookAboutId", function(req, response) {

    let idBook = req.query.idBook;

    showLogMessagge("ile jest ksiażek o id " + idBook)


    connection.query("SELECT user.login as userName,single_book_mark.MarkBook as userMark,single_book_mark.UserOpinion as userOpinion,count(user.login) as howManyComments  FROM `book` inner join single_book_mark on single_book_mark.IdBook=book.idBook inner join user on user.IdUser=single_book_mark.IdUser where book.idBook=" + idBook, function(er, res, x) {
        if (res.length > 0) {
            response.setHeader('Content-Type', 'application/json')
            showLogMessagge("Takich ksiażek jest" + res[0].howManyComments)
            response.end(JSON.stringify({
                userName: res[0].userName,
                userMark: res[0].userMark,
                userOpinion: res[0].userOpinion,
                howManyComments: res[0].howManyComments
            }))
        }


    })
})


app.get("/getCommentBook", function(req, response) {
    let idBook = req.query.idBook;
    let position = req.query.position;
    showLogMessagge("Pokazuje komentarz ksiażki o id " + idBook + " a pozycja " + position)


    connection.query("SELECT user.login as userName,single_book_mark.MarkBook as userMark,single_book_mark.UserOpinion as userOpinion FROM `book` inner join single_book_mark on single_book_mark.IdBook=book.idBook inner join user on user.IdUser=single_book_mark.IdUser where book.idBook=" + idBook + " limit " + position + " ,1", function(er, res, x) {
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


})



app.get("/getImageBook", function(request, response) {
    let numberBook = request.query.numberBook;

    response.sendFile("C:\\BookWebServer\\img\\" + numberBook + ".jpg")

})



app.post("/deleteYoursMarkBook", function(request, response) {
    let idBook = request.body.IdBook;
    showLogMessagge("Usuwam ocenke")
    let emailUser = request.body.emailUser;
    showLogMessagge("SELECT user.IdUser as user FROM `single_book_mark` inner join user on user.IdUser=single_book_mark.IdUser where user.EmailAdress='" + emailUser + "' and single_book_mark.IdBook=" + idBook)
    connection.query("SELECT user.IdUser as user FROM `single_book_mark` inner join user on user.IdUser=single_book_mark.IdUser where user.EmailAdress='" + emailUser + "' and single_book_mark.IdBook=" + idBook, function(er, res, x) {
        if (res.length > 0) {
            showLogMessagge("Usuwam ocenę ks:" + idBook + " usera:" + res[0].user)
            connection.query('Delete from single_book_mark where IdUser=' + res[0].user + " and IdBook=" + idBook)
            response.end(JSON.stringify({
                ok: "ok"
            }))
        }
    })

})




app.get("/howManyBookWithOneCategoryFilter", function(request, response) {
    let category = request.query.category
    let markStart = request.query.markStart
    let markEnd = request.query.markEnd
    let yearsStartPublish = request.query.yearsStartPublish
    let yearsEndPublish = request.query.yearsEndPublish
    let authorsName = request.query.authorsName
    let authorsSurname = request.query.authorsSurname
    showLogMessagge("Filter 2:select count(*) as how from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%" + category + "\%' and book.yearPublish>" + yearsStartPublish + " and book.yearPublish<" + yearsEndPublish + " and writers.name like '\%" + authorsName + "\%' and writers.surname like '\%" + authorsSurname + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  having ROUND(avg(single_book_mark.MarkBook),2)>" + markStart + " and ROUND(avg(single_book_mark.MarkBook),2)<" + markEnd)


    try {
        connection.query("select count(*) as how from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%" + category + "\%' and book.yearPublish>=" + yearsStartPublish + " and book.yearPublish<=" + yearsEndPublish + " and writers.name like '\%" + authorsName + "\%' and writers.surname like '\%" + authorsSurname + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  having IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0)>=" + markStart + " and IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0)<=" + markEnd, function(err, res, x) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')
                //	response.end(JSON.stringify({howMany:res[0].how}))		
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

    showLogMessagge("select count(*) as how from book INNER join gentre on gentre.IdGentre=book.IdGentre where gentre.DescriptionGentre like  '\%" + category + "\%'")


    try {
        connection.query("select count(*) as how from book INNER join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like   '\%" + category + "\%'", function(err, res, x) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    howMany: res[0].how
                }))
            }
        })


    } catch (x) {
        showLogMessagge("Error:" + x)
    }



})


app.get("/getBookWithOneCategoryWithFilter", function(request, response) {
    let category = request.query.category
    let position = request.query.position
    let markStart = request.query.markStart
    let markEnd = request.query.markEnd
    let yearsStartPublish = request.query.yearsStartPublish
    let yearsEndPublish = request.query.yearsEndPublish
    let authorsName = request.query.authorsName
    let authorsSurname = request.query.authorsSurname

    showLogMessagge(category + " " + position + " " + markStart + " " + markEnd + " " + yearsStartPublish + " " + yearsEndPublish + " " + authorsName + " " + authorsSurname)

    showLogMessagge("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%" + category + "\%'  and book.yearPublish>=" + yearsStartPublish + " and book.yearPublish<=" + yearsEndPublish + " and writers.name like '\%" + authorsName + "\%' and writers.surname like '\%" + authorsSurname + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0) >=" + markStart + " and IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0) <=" + markEnd + " limit " + position + " ,1")
    try {
        connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%" + category + "\%'  and book.yearPublish>=" + yearsStartPublish + " and book.yearPublish<=" + yearsEndPublish + " and writers.name like '\%" + authorsName + "\%' and writers.surname like '\%" + authorsSurname + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0) >=" + markStart + " and IFNULL(ROUND(avg(single_book_mark.MarkBook),2),0) <=" + markEnd + " limit " + position + " ,1", function(err, res, x) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')
                var markBookFinal = res[0].markBook
                showLogMessagge("Daję książkę o pozycji :" + position)
                if (markBookFinal == null) {
                    showLogMessagge("Jest null daje o")
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
        showLogMessagge("Error:" + x)
    }



})


app.get("/getBookWithOneCategory", function(request, response) {
    let category = request.query.category
    let position = request.query.position



    showLogMessagge("Całe zapytanie:" + "select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentre on gentre.IdGentre=book.IdGentre where gentre.DescriptionGentre like '\%" + category + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  limit " + position + " ,1 ")
    try {
        connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook inner join gentreandbook on gentreandbook.idBook=book.idBook INNER join gentre on gentreandbook.idGentre=gentre.IdGentre where gentre.DescriptionGentre like   '\%" + category + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  limit " + position + " ,1 ", function(err, res, x) {
            if (res.length > 0) {
                response.setHeader('Content-Type', 'application/json')
                var markBookFinal = res[0].markBook
                showLogMessagge("Daję książkę o pozycji :" + position)
                if (markBookFinal == null) {
                    showLogMessagge("Jest null daje o")
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
        showLogMessagge("Error:" + x)
    }



})


app.get("/findBookHow", function(request, response) {
    let position = request.query.positionBook
    let filter = request.query.filterBook

    connection.query("SELECt count(book.Idbook) as howMany  from book inner join writers on writers.IdWriters=book.IdAuthors where book.nameBook like '\%" + filter + "\%' limit " + position + ",1", function(err, res) {
        if (res.length > 0) {
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({
                howMany: res[0].howMany
            }))

        }


    })


})


app.get("/returnBookWithNameFilter", function(request, response) {
    let position = request.query.positionBook
    let filter = request.query.filterBook

    showLogMessagge("Filtry")
    showLogMessagge("SELECt book.idBook as idBook,writers.name as author,writers.surname as sur,book.nameBook as nameBook  from book left outer join writers on writers.IdWriters=book.IdAuthors where book.nameBook like '\%" + filter + "\%' limit " + position + ",1")
    connection.query("SELECt book.idBook as idBook,writers.name as author,writers.surname as sur,book.nameBook as nameBook  from book left outer join writers on writers.IdWriters=book.IdAuthors where book.nameBook like  '\%" + filter + "\%' order by idBook limit " + position + ",1", function(err, res) {
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




})



app.get("/giveBookWithOneUserRead", function(request, response) {
    let numberBooks = request.query.numberBook;
    let userEmail = request.query.userEmail

    showLogMessagge("->2 select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre INNER join user on single_book_mark.IdUser=user.IdUser where user.EmailAdress='" + userEmail + "' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by  single_book_mark.markBook desc,book.nameBook desc,book.idBook desc limit " + numberBooks + " ,1")

    try {
        connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre INNER join user on single_book_mark.IdUser=user.IdUser where user.EmailAdress='" + userEmail + "' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by  single_book_mark.markBook desc,book.nameBook desc,book.idBook desc limit " + numberBooks + " ,1", function(err, res, x) {
            if (res.length > 0) {


                connection.query("select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where book.idBook=" + res[0].idBook, function(fgh, resp, ff) {
                    if (resp.length > 0) {
                        let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                        for (let i = 0; i < resp.length; i++) {
                            showLogMessagge(resp[i].gentreBook)
                            gentreBook[i] = resp[i].gentreBook
                        }

                        var markBookFinal = res[0].markBook
                        if (markBookFinal == null) {
                            showLogMessagge("Jest null daje o")
                            markBookFinal = 0

                        }
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
        showLogMessagge("Error:" + x)
    }
})

app.get("/giveBookWithOneCategory", function(request, response) {
    let numberBooks = request.query.numberBook;
    let filter = request.query.filter
    let lowerValueMark = request.query.lowerValueMark
    let biggerValueMark = request.query.biggerValueMark
    let lowerValueYears = request.query.lowerValueYears
    let biggerValueYears = request.query.biggerValueYears
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

    showLogMessagge(firstName + "/" + secondName)

    showLogMessagge("Chcę książke o numerze" + numberBooks + " z kategorii " + filter + " Ocena: " + lowerValueMark + "/" + biggerValueMark + " Lata:" + lowerValueYears + "/" + biggerValueYears + " autor" + nameAuthors)
    showLogMessagge("Kurwa:select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%" + filter + "\%' and book.yearPublish>" + lowerValueYears + " and book.yearPublish<" + biggerValueYears + " and writers.name like '%%' and writers.surname like '%%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING ROUND(avg(single_book_mark.MarkBook),2) >" + lowerValueMark + " and ROUND(avg(single_book_mark.MarkBook),2)<" + biggerValueMark + " limit " + numberBooks + " ,1")

    try {
        connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentreandbook on gentreandbook.idBook=book.idBook inner join gentre on gentre.IdGentre=gentreandbook.idGentre where gentre.DescriptionGentre like '\%" + filter + "\%' and book.yearPublish>=" + lowerValueYears + " and book.yearPublish<=" + biggerValueYears + " and writers.name like '%" + firstName + "%' and writers.surname like '%" + secondName + "%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre HAVING ROUND(IFNULL(avg(single_book_mark.MarkBook),1),2) >=" + lowerValueMark + " and ROUND(IFNULL(avg(single_book_mark.MarkBook),1),2)<=" + biggerValueMark + " limit " + numberBooks + " ,1", function(err, res, x) {
            if (res.length > 0) {


                connection.query("select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where book.idBook=" + res[0].idBook, function(fgh, resp, ff) {
                    if (resp.length > 0) {
                        let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                        for (let i = 0; i < resp.length; i++) {
                            showLogMessagge(resp[i].gentreBook)
                            gentreBook[i] = resp[i].gentreBook
                        }

                        var markBookFinal = res[0].markBook
                        if (markBookFinal == null) {
                            showLogMessagge("Jest null daje o")
                            markBookFinal = 0

                        }
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
        showLogMessagge("Error:" + x)
    }
})




app.get("/giveSearchBook", function(request, response) {
    let numberBooks = request.query.numberBook;
    let filter = request.query.filter
    showLogMessagge("Chcę książke o numerze" + numberBooks + " !!!")
    showLogMessagge("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentre on gentre.IdGentre=book.IdGentre where book.nameBook like '\%" + filter + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre  limit " + numberBooks + " ,1 ")

    try {
        connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook left outer join gentre on gentre.IdGentre=book.IdGentre where book.nameBook like '\%" + filter + "\%' group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by idBook limit " + numberBooks + " ,1 ", function(err, res, x) {
            if (res.length > 0) {

                showLogMessagge("12:" + "select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where idBook=" + res[0].idBook)
                connection.query("select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where book.idBook=" + res[0].idBook, function(fgh, resp, ff) {
                    if (resp.length > 0) {
                        let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                        for (let i = 0; i < resp.length; i++) {
                            showLogMessagge(resp[i].gentreBook)
                            gentreBook[i] = resp[i].gentreBook
                        }

                        var markBookFinal = res[0].markBook
                        if (markBookFinal == null) {
                            showLogMessagge("Jest null daje o")
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
                            gentre_1: gentreBook[0],
                            gentre_2: gentreBook[1],
                            gentre_3: gentreBook[2],
                            gentre_4: gentreBook[3],
                            gentre_5: gentreBook[4],
                            gentre_6: gentreBook[5],
                            gentre_7: gentreBook[6],
                            gentre_8: gentreBook[7]
                        }))
                        showLogMessagge("Wysąłłem odp")

                    }
                })

                response.setHeader('Content-Type', 'application/json')

            }
        })


    } catch (x) {
        showLogMessagge("Error:" + x)
    }
})


app.get("/givePopularBook", function(request, response) {
    let numberBooks = request.query.numberBook;
    showLogMessagge("Chcę książke o numerze Popularne:" + numberBooks)
    showLogMessagge("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentre on gentre.IdGentre=book.IdGentre group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by count(single_book_mark.IdBook) desc limit " + numberBooks + " ,1 ")

    try {
        connection.query("select book.idBook as idBook,book.Description as description,book.countPage as page,book.yearPublish as year,book.nameBook as titleBook,writers.name as nameAuthor,writers.surname as surnameAuthor,count(single_book_mark.IdBook) as countMark,ROUND(avg(single_book_mark.MarkBook),2) as markBook,gentre.DescriptionGentre as gentreBook from book left outer join writers on book.idAuthors=writers.IdWriters left outer join single_book_mark on single_book_mark.IdBook=book.idBook INNER join gentre on gentre.IdGentre=book.IdGentre group by single_book_mark.IdBook,book.nameBook,writers.name,writers.surname,gentre.DescriptionGentre order by count(single_book_mark.IdBook) desc limit " + numberBooks + " ,1 ", function(err, res, x) {
            if (res.length > 0) {



                connection.query("select gentre.DescriptionGentre as gentreBook from book left outer join gentreandbook on gentreandbook.idBook=book.idBook left outer join gentre on gentre.IdGentre=gentreandbook.idGentre where book.idBook=" + res[0].idBook, function(fgh, resp, ff) {
                    if (resp.length > 0) {
                        let gentreBook = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
                        for (let i = 0; i < resp.length; i++) {
                            showLogMessagge(resp[i].gentreBook)
                            gentreBook[i] = resp[i].gentreBook
                        }

                        var markFinasl = res[0].markBook
                        if (markFinasl == null) {
                            markFinasl = 0
                        }

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
        showLogMessagge("Error:" + x)
    }
})



app.post('/registerUser', function(request, response) {

    var login = request.body.login;
    var email = request.body.email;
    var password = request.body.password;
    showLogMessagge("Rejestruję użytkownika:" + login)

    randomCode = randomCodeValityRegister(login)
    sendMailWithVerificationCode(randomCode, email)




    var passwordHash = require('password-hash');
    var hashedPassword = passwordHash.generate(password);

    connection.query("DELETE FROM user_no_verify where login=\'" + login + "\' or email=\'" + email + "\'", function(err, res) {
        if (err) throw err;
        showLogMessagge("Usuwam użytkownika z niezwerfikowanych")
    })



    connection.query("INSERT INTO user_no_verify values(null,\'" + randomCode + "\',\'" + hashedPassword + "\',\'" + login + "\',\'" + email + "\')", function(err, res) {
        if (err) throw err;
        showLogMessagge("Dodaję użytkownika do użytkowników")


    })



    showLogMessagge("DODANO UŻYTKOWNIKA" + login)
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({
        emailSend: true
    }))




})




app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    showLogMessagge("Próba logowania użytkownika:" + username)

    var passwordHash = require('password-hash');

    var hashedPassword = passwordHash.generate(password);



    if (username && password) {
        connection.query("Select Password from user where EmailAdress=? or Login=?", [username, username], function(err, res, fie) {
            if (res.length > 0) {

                if (passwordHash.verify(password, res[0].Password)) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    response.setHeader('Content-Type', 'application/json')
                    showLogMessagge("Zalogowano:" + username)
                    response.end(JSON.stringify({
                        isAuthenticationSucceeded: true,
                        messageAuthentication: "Zalogowano"
                    }))

                } else {
                    response.setHeader('Content-Type', 'application/json')
                    showLogMessagge("Nie zalogowano (Błędne dane logowania):" + username)
                    response.end(JSON.stringify({
                        isAuthenticationSucceeded: false,
                        messageAuthentication: "Zły login lub hasło"
                    }))
                }
                response.end();

            } else {
                showLogMessagge("Nie zalogowano (Błędne dane logowania):" + username)
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    isAuthenticationSucceeded: false,
                    messageAuthentication: "Zły login lub hasło"
                }))
            }
            response.end();

        })


    } else {
        showLogMessagge("Nie zalogowano (Błędne dane logowania):" + username)
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({
            isAuthenticationSucceeded: false,
            messageAuthentication: "Zły login lub hasło"
        }))
    }
});

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
        request.session.loggedin = false;
        response.send('Goodbye , ' + request.session.username + '!');
    } else {
        response.send('But you don,t login');
    }
    response.end();
});

app.listen(3000);