function fields(newBody, standard, next, callback){
  // newBody = hash, standard = hash
  if (Object.keys(newBody).length !== Object.keys(standard).length) throw 'fields unmatch';

  for (prop in newBody){
    if (Object.keys(standard).indexOf(prop) == -1) throw 'fields unmatch';
  }
  if (!next) {return callback(null)}
  return next(newBody, callback)
}

function password(params, callback){
  if (params.old_password == params.new_password) throw 'New password cannot be the same as current password'
  callback(null)
}

module.exports = {
  fields   : fields,
  password : password
}