var app = angular.module("timeManagementApp", []); 
app.controller("myCtrl", function($scope,$http) {

    $scope.user=user;
    
    $scope.showRemaingingDays=function(){
        return "22 day";
    }

})
.directive('storyPanel', function() {
  return {
    templateUrl: '../Directives/storyPanel.html'
  };
});


var user = {
    name: "Bogdan",
    password: "pass",
    story: [
        {
            name: "Learn HTML/CSS",
            description: "You have to learn the basics of a HTML page and then how to style it using CSS",
            start_time: "2018-10-18",
            finish_time: "2018-11-18",
            state: "0",             //that means in progress and 1 means done        
            task: [
                {
                    name: "Learn Html",
                    description: "Learn how to create a basic html page",
                    start_time: "2018-10-18",
                    finish_time: "2018-11-18",
                    state: "0"
                },
                {
                    name: "Learn CSS",
                    description: "Learn how to style a Html page using a CSS file",
                    start_time: "2018-10-18",
                    finish_time: "2018-11-18",
                    state: "0"
                }
            ]
        },
        {
            name: "Thesis",         // Asta inseamna licenta :)))
            description: "You have to study for the writen exam and make your project and documentation",
            start_time: "2018-10-18",
            finish_time: "2019-01-31",
            state: "0",
            task: [
                {
                    name: "Study",
                    description: "You have to study for your writen exam",
                    start_time: "2018-10-18",
                    finish_time: "2018-11-18",
                    state: "0"
                },
                {
                    name: "Thesis project",
                    description: "You have to make your Thesis project",
                    start_time: "2018-10-18",
                    finish_time: "2019-01-31",
                    state: "1"              //Ma gandeam sincer sa pun 1 ca pe asta il ai gata
                },
                {
                    name: "Documentation",
                    description: "You have to write at least 60 pages in word format for the Thesis Documentation",
                    start_time: "2018-10-18",
                    finish_time: "2019-01-31",
                    state: "0"
                }
            ]
        }
    ],
    task: [
        {
            name: "Learn Html",
            description: "Learn how to create a basic html page",
            start_time: "2018-10-18",
            finish_time: "2018-11-18",
            state: "0"
        },
        {
            name: "Learn CSS",
            description: "Learn how to style a Html page using a CSS file",
            start_time: "2018-10-18",
            finish_time: "2018-11-18",
            state: "0"
        },
        {
            name: "Study",
            description: "You have to study for your writen exam",
            start_time: "2018-10-18",
            finish_time: "2018-11-18",
            state: "0"
        },
        {
            name: "Thesis project",
            description: "You have to make your Thesis project",
            start_time: "2018-10-18",
            finish_time: "2019-01-31",
            state: "0"
        },
        {
            name: "Documentation",
            description: "You have to write at least 60 pages in word format for the Thesis Documentation",
            start_time: "2018-10-18",
            finish_time: "2019-01-31",
            state: "0"
        }
        
    ]
};