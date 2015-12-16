function getTimelines(req, res){
  console.log(req.user)
  // return lists of timelines base on relationship of req.user
  // 1) meToo relationships
  // 2) favourites
  // 3) likes
  // 4) questions
  // 5) cheer
}

function getTimeline(req, res){
  console.log('in timeline')
}

module.exports = {
  getTimelines : getTimelines,
  getTimeline  : getTimeline
}