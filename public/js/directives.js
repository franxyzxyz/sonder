app.directive('ngConfirmClick', ngconfirmclick);
app.directive('favlist', FavList);
app.directive('miniprofile', mini_profile);
app.directive('tree', treeD3);

function editSetting(){
  var directive = {};
  directive.restrict = 'EA';
  directive.replace = true;
  directive.templateUrl = "template/_editSetting.html";
  directive.scope = {
    field : '@',
    fieldName : '@',
    editvalue : '=',
    onSave : '&'
  }

  return directive;
}

function FavList(){
  var directive = {};
  directive.restrict = 'EA';
  directive.replace = true;
  directive.templateUrl = "template/_fav.html";
  directive.scope = {
    fav : '@'
  }
  return directive;
}

function ngconfirmclick(){
  var directive = {};
  directive.restrict = 'A';
  directive.link = function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngConfirmClick);
                }
            });

  }
  return directive;
}

function mini_profile(){
  var directive = {};
  directive.restrict = 'EA';
  directive.replace = true;
  directive.templateUrl = "template/_miniprofile.html";
  directive.scope = {
    user : '@'
  }
  return directive;
}

function treeD3($window){
  var directive = {};
  directive.restrict = 'EA';
  // directive.template = "<svg width='850' height='200'></svg>";
  directive.scope = {
    stage: "="
  }
  directive.link =  function(scope, element, attrs){
    var d3 = $window.d3;
    // var rawSvg = element.find('svg')[0];
    var vis = d3.select("#svg_target")
                      .append("svg")
                      .attr("width", 850)
                      .attr("height", 500);

    scope.$watch('stage', function(value, oldVal){
      console.log(_.sortBy(value, function(elem){
        return elem.start
      }))
      vis.selectAll('*').remove();
      var x_pos = 5;
      if (scope.stage){
      var layers = vis.selectAll("*")
                      .data(value)
                      .enter()
                      .append("circle")
                      .attr("cx",function(d){
                        x_pos*=4
                        return x_pos
                      })
                      .attr("cy",function(d){
                        return x_pos - 100
                      })
                      .attr("r",50);
                   vis.selectAll("text")
                      .data(value)
                      .enter()
                      .append("text")
                      .text(function(d){
                        return d.title
                      })


                  // .text(function(d){
                  //   return d.title
                  // })
                  // .attr({
                  //   x: function(d){console.log(d); return 10}
                  // });
                  // .attr("width",600);

      }
    })
  }
  return directive;
}
