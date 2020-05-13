var mysql = require('mysql');


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:"bookwebdatabase"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});



 
 
  var http=require('http')


  var server=http.createServer((function(request,response){
      response.writeHead(200,{"Content-Type":"text/plain"});

      
con.connect(function(err) {
    
    con.query("SELECT * FROM gentre", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      zma = JSON.stringify(result);
      response.end(zma);
      
    });
  });

  } ))
  server.listen(7675);