 var passwordHash = require('password-hash');

    var hashedPassword = passwordHash.generate('123456');

    console.log(hashedPassword);