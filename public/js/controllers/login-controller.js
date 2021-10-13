angular.module('alurapic')
.controller('LoginController', function($scope, $http, $location){
    
    $scope.usuario = {};
    $scope.mensagem = '';

    $scope.autenticar = function(){
        var usuario = $scope.usuario;

        $http.post('/autentica', {login: usuario.login, senha: usuario.senha})
        .then(function(){
            $location.path('/');
        }, function(error){
            console.log(error);
            $scope.usuario = {};
            $scope.mensagem = 'Usuário ou senha inválido';
        })   
    }

});