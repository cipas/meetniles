// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('niles', ['ionic', 'ionic-material', 'ionMdInput', 'ngRoute', 'door3.css'])
.config(function($stateProvider, $urlRouterProvider, $routeProvider) {

  $stateProvider
    .state('intro', {
      url: '/',
      templateUrl: 'templates/intro.html',
      controller: 'IntroCtrl'
    })
    .state('main', {
      url: '/main',
      templateUrl: 'templates/main.html',
      controller: 'MainCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl'
    })
    .state('chat', {
      url: '/chat',
      templateUrl: 'templates/chat.html',
      controller: 'ChatCtrl',
      params: {'clientname' : null}
    });

  $routeProvider
    .when('/chat', {
      templateUrl: 'templates/chat.html',
      controller: 'ChatCtrl',
      /* Now you can bind css to routes */
      css: 'css/chat.css'
    })
    .when('/intro', {
      templateUrl: 'templates/intro.html',
      controller: 'IntroCtrl',
      /* Now you can bind css to routes */
      css: 'css/scroll-hack.css'
    })
    .when('/login', {
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl',
      /* Now you can bind css to routes */
      css: 'css/scroll-hack.css'
    })
    .when('/register', {
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl',
      /* Now you can bind css to routes */
      css: 'css/scroll-hack.css'
    });

  $urlRouterProvider.otherwise("/");

})
.controller('IntroCtrl', function($scope, $state) {
 console.log('IntroCtrl');
  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('main');
  };

  $scope.toLogin = function(){
    $state.go('login');
  };

  $scope.toRegister = function() {
    $state.go('register');
  };

})
.controller('RegisterCtrl', function($scope, $state, $http, $rootScope, client) {
  console.log('RegisterCtrl');

  $scope.toIntro = function() {
    $state.go('intro');
  };

})
.controller('LoginCtrl', function($scope, $state, $http, $rootScope, client) {
  console.log('LoginCtrl');

  $scope.toIntro = function() {
    $state.go('intro');
  };

  $scope.logIn = function(user) {
    $http({
        method: "post",
        url: "http://localhost:8000/login",
        data: {
            phone: user.phone,
            password: user.password
        }
    }).then(function successCallback(response) {
    // this callback will be called asynchronously
    // when the response is available
      //console.log(response.data.name);
      //
      //$scope.objectValue.data = response.data.name;
      //sharedProperties.setString(response.data.name);
     // client.setClientName("asdfhg");
     // 
      $state.go('chat', { clientname: response.data.name });

    }, function errorCallback(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
    });
  };

})
.controller('MainCtrl', function($scope, $state) {
  console.log('MainCtrl');


})
.controller('ChatCtrl', function($stateParams, $scope, /*socket,*/ $sanitize, $ionicScrollDelegate, $timeout, $rootScope, client, $http) {

    var self = this;
    var typing = false;
    var lastTypingTime;
    var TYPING_TIMER_LENGTH = 400;
    var connected;

    window.localStorage['clientname'] = $stateParams.clientname;
    // console.log('client name: ' + clientname);
    //$scope.objectValue = sharedProperties.getObject().data;

    //var nickname;
    //Add colors
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    //initializing messages array
    self.messages = [];
    var color = false ? getUsernameColor("Niles") : null;
    //console.log(client.name);
    self.messages.push({
            content: $sanitize('Welcome Mr. ' + window.localStorage['clientname'] + '. My name is Niles.'),
            style: true,
            username: "Niles",
            mine: true,
            color: color
        });

    $timeout(function() {
        self.messages.push({
            content: $sanitize('How can I help you ?'),
            style: true,
            username: "Niles",
            mine: true,
            color: color
        });
    }, 1500);
    
    //function called when user hits the send button
    self.sendMessage = function() {
        //socket.emit('new message', self.message)
        addMessageToList($stateParams.nickname, true, self.message);
        getWitInterpretation(self.message);
        //socket.emit('stop typing');
        self.message = "";
    };

    //function called on Input Change
    self.updateTyping = function() {
        sendUpdateTyping();
    };

    function getWitInterpretation( message ) {
      //var data = { username: "Niles" }
      addChatTyping( "Niles" );

      $http({
          method: "post",
          url: "http://localhost:8000/wit",
          data: {
              'message': message
          }
      }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
        //console.log(response.data.name);
        //
        //$scope.objectValue.data = response.data.name;
        //sharedProperties.setString(response.data.name);
       // client.setClientName("asdfhg");
       // 
        console.log(response.data.chart);

        self.messages.push({
            content: $sanitize(response.data.message),
            chart: response.data.chart,
            style: true,
            username: "Niles",
            mine: true,
            color: color
        });

        removeChatTyping("Niles");

        $ionicScrollDelegate.scrollBottom();

      }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      });
    }

    // Display message by adding it to the message list
    function addMessageToList(username, style_type, message) {

        username = $sanitize(username);
        removeChatTyping(username);
        var color = style_type ? getUsernameColor(username) : null;
        self.messages.push({
            content: $sanitize(message),
            style: style_type,
            username: username,
            mine: (self.nickname == username) ? true : false,
            color: color
        });

        $ionicScrollDelegate.scrollBottom();
    }

    //Generate color for the same user.
    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // Updates the typing event
    function sendUpdateTyping() {
        if (connected) {
            if (!typing) {
                typing = true;
                //socket.emit('typing');
            }
        }
        lastTypingTime = (new Date()).getTime();
        $timeout(function() {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                //socket.emit('stop typing');
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    }

    // Adds the visual chat typing message
    function addChatTyping(username) {
        //addMessageToList(username, false, username + " is searching");
        $scope.loadingIndicator = true;
        $ionicScrollDelegate.scrollBottom();
    }

    // Removes the visual chat typing message
    function removeChatTyping(username) {
        /*self.messages = self.messages.filter(function(element) {
            return element.username != username || element.content != username + " is searching";
        });*/
        $scope.loadingIndicator = false;
    }

    // Return message string depending on the number of users
    function message_string(number_of_users) {
        return number_of_users === 1 ? "there's 1 participant" : "there are " + number_of_users + " participants"
    }
})
.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                    scope.$apply(function(){
                            scope.$eval(attrs.ngEnter);
                    });
                    
                    event.preventDefault();
            }
        });
    };
})
.factory('client', function() {
    //var items = [];
    var clientname;
    var myClientService = {};
    
    myClientService.setClientName = function(name) {
        clientname = name;
    };
    /*myBasketService.removeItem = function(item) {
        var index = items.indexOf(item);
        items.splice(index, 1);
    };*/
    myClientService.getClientName = function() {
        return clientname;
    };
    
    return myClientService;
})
.run(function($ionicPlatform,$location,$rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  $location.path('/tab/dash');
  $rootScope.$apply();
  });
})