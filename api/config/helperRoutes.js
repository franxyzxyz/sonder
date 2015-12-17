var express        = require('express');
var router         = express.Router();
var _              = require('underscore');

var formList = require('../helpers/form_list')

router.get('/helper/industry', function(req, res){
  res.status(200).json({industry: formList.industry})
})

router.get('/helper/location', function(req, res){
  res.status(200).json({location: _.values(formList.location).sort()})
})

router.get('/helper/category', function(req, res){
  res.status(200).json({category: _.values(formList.category).sort()})
})

router.get('/helper/all', function(res, res){
  res.status(200).json({industry: formList.industry,location: _.values(formList.location).sort(),category: _.values(formList.category).sort()})
})
module.exports = router