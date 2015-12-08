var seraphModel = require('seraph-model');

var User = seraphModel(db, 'user');

// User.schema = {
//   username   : { type: String, required: true },
//   email      : { type: String, required: true },
//   password   : { type: String, required: true },
//   category   : { type: String, enum:['Tech','Design','Engineering','Finance'] },
//   location   : { type: String },
//   anonymous  : { type: Boolean }
// };

User.schema = {
  username   : { type: String, required: true },
  password   : { type: String, required: true },
  email      : { type: String, required: true },
  name       : { type: String },
  category   : { type: String, enum:['Tech','Design','Engineering','Finance'] },
  location   : { type: String },
  anonymous  : { type: Boolean }
};

User.setUniqueKey('username');
User.setUniqueKey('email');

module.exports = User