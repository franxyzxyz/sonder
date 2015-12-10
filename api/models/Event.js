var seraphModel = require('seraph-model');
var Event = seraphModel(db, 'event');

Event.schema = {
  title         : { type: String, required: true},
  event_type    : { type: String, enum:['Education','Career','High Point','Low Point','Happiest','Interest'], required: true},
  date          : { type: Date, required: true},
  description   : { type: String, required: true},
  tag           : { type : Array, required: true}
};

module.exports = Event