var seraphModel = require('seraph-model');
var Event = seraphModel(db, 'event');
var formList    = require('../helpers/form_list')

Event.schema = {
  title         : { type: String, required: true},
  event_type    : { type: String, enum: formList.category, required: true},
  date          : { type: Date, required: true},
  description   : { type: String, required: true},
  tag           : { type : Array, required: true}
};

module.exports = Event