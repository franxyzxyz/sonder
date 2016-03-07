function fields(newBody, standard, next, callback){
  // newBody = hash, standard = hash
  if (Object.keys(newBody).length !== Object.keys(standard).length) throw 'Oops. Fields missing!';

  for (prop in newBody){
    if (Object.keys(standard).indexOf(prop) == -1) throw 'Oops. Fields missing!';
  }
  if (!next) {return callback(null)}
  return next(newBody, callback)
}

function password(params, callback){
  if (params.old_password == params.new_password) throw 'New password cannot be the same as current password'
  callback(null)
}

function dateRange(params, callback){
  var start = new Date(params.start);
  var end   = new Date(params.end);

  if (start == 'Invalid Date' || end == 'Invalid Date') throw 'Invalid Date';
  if (new Date(params.start) > new Date(params.end)) throw 'start date cannot be later than the end date'
  callback(null, true)
}

function multipleFields(newBody, standard, limitation, next, callback){
  console.log(Object.keys(newBody))
  console.log(Object.keys(standard))
  if (Object.keys(newBody).length !== Object.keys(standard).length) throw 'Oops. Fields missing!';
  for (prop in newBody){
    if (Object.keys(standard).indexOf(prop) == -1) throw 'Oops. Fields missing!';
  }

  if (!next) {return callback(null)}
  return next(newBody, limitation, callback)
}

function eventDateRange(newBody, stage, callback){
  if (newBody.date == 'Invalid Date') throw 'Invalid Date';
  if (newBody.date < stage.start || newBody.date > stage.end) throw 'date of event is out of the range of the requested stage';
  callback(null)
}

module.exports = {
  fields   : fields,
  multipleFields : multipleFields,
  password : password,
  dateRange: dateRange,
  eventDateRange : eventDateRange,
}