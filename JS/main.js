var app = angular.module("timeManagementApp", ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider.when("/",{
        templateUrl:"Contents/home.html"
    }).when("/tasks",{
        templateUrl:"Contents/content.html"
    }).when("/login",{
        templateUrl:"Contents/login.html"
    }).when("/home",{
        templateUrl:"Contents/home.html"
    }).otherwise({redirectTo:'/'})
});

app.controller("taskController", function($scope,$http,$interval,$window,projectService,taskService,userService) {
    $scope.user={
        id:userService.getUser().id,
        project:[]
    }

    $scope.checkbox;
    projectService.getProjectsForUser(userService.getUser().id,(data) => {$scope.user.project=data;});


    // Change the task status function
    $scope.checkboxFunction=function(task){
        if(task.state==0)
        {
            task.state=1;
        }
        else{
            task.state=0;
        }
        var statusRequest={
            method: 'PUT',
            url: 'http://localhost:8080/TaskManagement/api/task/'+task.id,
            headers: {
                'Content-Type': 'application/json'
            },
            data:{ 
                state:task.state
            }
        }

        $http(statusRequest).then(function succes() {
            console.log("a mers");
        }, function error() {
            alert("Incorect Name or Password");
        })};





    /*  var req = {
     method: 'GET',
     url: 'http://localhost:8080/TaskManagement/api/project/12',
     headers: {
       'Content-Type': 'application/json'
     }
    }; 

    $http(req).then(function succes(response) {
        $scope.project = response.data;
    }, function error(response) {
        $scope.project = response.statusText;
    });;*/

    //Reimprospateaza pagina la fiecare secunda
    $interval(function(){
    }, 1000)


    //###################   Pentru Project   ##############################
    //###################################################################
    //Buton pentru afisarea si ascunderea taskurilor dintr-un project

    $scope.showAndHideTasks=function(project,event){
        if(project.showTasks)
        {
            project.showTasks=!project.showTasks;    

        }
        else{
            project.showTasks=true;

        }

        var projectIndex=-1;
        for(var i=0;i<$scope.user.project.length;i++)
        {
            if($scope.user.project[i].id==project.id){
                projectIndex=i;
                break;
            }
        }

        if(projectIndex==-1)
            return;

        taskService.getTasksForProject(project.id,(data)=>{$scope.user.project[projectIndex].task=data});   
        event.target.value=project.showTasks ? 'Hide the Tasks' : 'Show the Tasks';
    }

    //zilele ramase la fiecare project
    $scope.showRemaingingDays=function(project){
        project.finish_time=project.finish_time.substring(0,20);
        var finishDate=new Date(project.finish_time);//Data pana la care trebuie sa fie terminat proiectul 
        var curentDate=new Date();                    //Data curenta
        var timeDiff = finishDate.getTime() - curentDate.getTime();    //diferenta intre cele 2 date
        var diffDays;
        if(timeDiff>0)
        {
            diffDays = Math.ceil(Math.abs(timeDiff) / (1000 * 3600 * 24));  //se afla diferenta in zile
            return diffDays +" days";
        }
        return "expired";

    };


    //numarul project care sunt active
    $scope.activeProjectNumber=function(project){  

        if(project.length == 0){
            return;
        }

        var index;
        var activeProjectNumber=0;
        for (index=0;index<project.length;++index)
        {
            activeProjectNumber++;
        }
        return activeProjectNumber;
    };

    //numarul de project care sunt terminate
    $scope.completedProjectNumber=function(project){

        if(project.length==0){
            return;
        }

        var index;
        var completedProjectNumber=0;
        for (index=0;index<project.length;++index)
        {
            if(project.state==1)
            {
                completedProjectNumber++;
            }
        }
        return completedProjectNumber;
    };

    //timpul pana la expirarea primului project
    $scope.criticalProject=function(project){

        if(project.length==0){
            return;
        }

        var index;   // index folosit la parcurgerea array de project
        var min;   // valoarea cea mai mica de timp pana la expirarea unui project si care va fii initial primul element din array
        var minIndex=0; // indexul project-ului care va expira primul si care e initial            
        var finishDate=new Date(project[0].finish_time);   //Data pana la care trebuie sa fie terminat proiectul pentru primul elemement
        var curentDate=new Date();                    //Data curenta
        var timeDiff; // diferenta dintre data de sfarsit si data curenta
        var seconds;    

        min=Math.abs(finishDate.getTime() - curentDate.getTime());          

        // se parcurge array de project incepand de la al doilea    
        for(index=1;index<project.length;++index)    
        {
            finishDate=new Date(project[index].finish_time);
            curentDate=new Date(); 
            timeDiff = Math.abs(finishDate.getTime() - curentDate.getTime()); 
            if(timeDiff<min)
            {
                min=timeDiff;
                minIndex=index;
            }

        }
        finishDate=new Date(project[minIndex].finish_time);
        curentDate=new Date(); 

        //Math.ceil takes a float/decimal and rounds up
        seconds= Math.ceil(Math.abs(finishDate.getTime() - curentDate.getTime())/1000);

        return secondsToHms(seconds);

    };


    //Functie care verifica daca un task este completat/incomplet/expirat
    $scope.checkIfCompleted=function(task){
        if(task.state==0){
            $scope.checkbox=false;
            return "Incomplete";
        }
        else if(task.state==1){
            $scope.checkbox=true;
            return "Completed";
        }
        else{
            return "Expired";
        }
    };

    //Functie care transforma secundele in ore, minute si secunde
    function secondsToHms(d) {
        d = Number(d);
        //Math.floor takes a float and rounds down.
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        return h + ":"+ m + ":" + s; 
    };

    //###################   Pentru Diagrama  ############################
    //###################################################################

    $scope.taskDashboard=true;
    $scope.taskManagement=false;

    //Functie folosita pentru a schimba care dintre cele 2 directive va fii vizualizata de client
    $scope.taskDashboardFunction=function(task){
        $scope.taskDashboard=true;
        $scope.taskManagement=false;
    }

    //Functie folosita pentru a schimba care dintre cele 2 directive va fii vizualizata de client
    $scope.taskManagementFunction=function(task){
        $scope.taskDashboard=false;
        $scope.taskManagement=true;
    }
});

app.controller("loginController", function($scope,$http,$interval,$window,projectService,taskService,userService) {

    $scope.user={
        project:[]
    }

    $scope.name;
    $scope.password;

    $scope.loginFunction=function(){
        userService.login($scope.name,$scope.password,(data) => {$scope.user.id=data.id;$scope.user.name=data.name});
    }

})


//###################   Directive  ############################
//#############################################################
    .directive('projectPanel', function() {
    return {
        templateUrl: './Directives/projectPanel.html'
    };
})
    .directive('header', function() {
    return {
        templateUrl: './Directives/header.html'
    };
})
    .directive('footer', function() {
    return {
        templateUrl: './Directives/footer.html'
    };
})
    .directive('modals', function() {
    return {
        templateUrl: './Directives/modals.html'
    };
    }).
    .directive('projectDiagram', function() {
    return {
        templateUrl: './Directives/projectDiagram.html'
    };

});

var user = {
    name: "Bogdan",
    password: "pass",
    project: [
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
                    finish_time: "2019-01-31",
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

app.service('userService',['$http', function($http){
    var user={};

    this.getUser=function(){
        return user;
    };

    this.login=function(name,password,callback){
        var loginRequest = {
            method: 'POST',
            url: 'http://localhost:8080/TaskManagement/api/user/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data:{ 
                name:name,
                password:password
            }
        }
        $http(loginRequest).then(function succes(response) {
            user.id=response.data;
            user.name=name;
            callback(user);
        }, function error() {
            alert("Incorect Name or Password");
        });
    };
}])

app.service('projectService',['$http', function($http) {

    this.getProjectsForUser = function (userId,callback) {
        var req = {
            method: 'GET',
            url: 'http://localhost:8080/TaskManagement/api/project/getProjectsForUser',
            headers: {
                'Content-Type': 'application/json'
            },
            params:{ 
                userId:userId
            }
        };
        $http(req).then(function succes(response) {
            callback(response.data);
        }, function error() {
            alert("Incorect Name or Password");
        })};
}]);

app.service('taskService',['$http', function($http) {

    this.getTasksForProject =function (projectId,callback) {
        var req = {
            method: 'GET',
            url: 'http://localhost:8080/TaskManagement/api/task/getTasksForProject',
            headers: {
                'Content-Type': 'application/json'
            },
            params:{ 
                projectId:projectId
            }
        };
        $http(req).then(function succes(response) {
            console.log(response.data);
            callback(response.data);
        }, function error() {
            alert("Incorect Name or Password");
        })};
}]);
