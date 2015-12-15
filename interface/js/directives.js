app.directive('ngConfirmClick', ngconfirmclick);
app.directive('favlist', FavList);
app.directive('miniprofile', mini_profile);

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
