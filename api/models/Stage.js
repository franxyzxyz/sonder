var seraphModel = require('seraph-model');

var Stage = seraphModel(db, 'stage');

Stage.schema = {
  title       : { type: String, required: true },
  description : { type: String, required: true },
  start       : { type: Date, required: true },
  end         : { type: Date, required: true },
};

module.exports = Stage