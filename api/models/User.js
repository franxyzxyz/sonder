var seraphModel = require('seraph-model');
var User = seraphModel(db, 'user');

User.schema = {
  username   : { type: String, required: true },
  password   : { type: String, required: true },
  email      : { type: String, required: true },
  name       : { type: String, required: true },
  category   : { type: String, enum:['Tech','Design','Engineering','Finance'], required: true },
  location   : { type: String, required: true },
  anonymous  : { type: Boolean, required: true }
};

User.setUniqueKey('username');
User.setUniqueKey('email');

module.exports = User