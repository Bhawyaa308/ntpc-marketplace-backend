const bcrypt = require("bcrypt");

bcrypt.hash("Sadmin@123", 10).then(console.log);