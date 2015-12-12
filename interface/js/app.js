var app = angular.module('sonder',[])
                 .config(authRoute);

function authRoute($httpProvider){
  $httpProvider.interceptors.push('authInterceptor')
}