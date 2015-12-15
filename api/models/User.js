var seraphModel = require('seraph-model');
var User        = seraphModel(db, 'user');
var formList    = require('../helpers/form_list')
var _           = require('underscore');

User.schema = {
  username   : { type: String, required: true },
  password   : { type: String, required: true },
  email      : { type: String, required: true },
  name       : { type: String, required: true },
  industry   : { type: String, enum: formList.industry, required: true },
  role       : { type: String, required: true},
  location   : { type: String, enum: _.values(formList.location), required: true },
  anonymous  : { type: Boolean, required: true }
};

User.setUniqueKey('username');
User.setUniqueKey('email');

module.exports = User