var app = angular.module("timeManagementApp", ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider.when("/",{
        templateUrl:"Contents/login.html"
    }).when("/projects",{
        templateUrl:"Contents/projects.html"
    }).when("/diagrams",{
        templateUrl:"Contents/diagrams.html"
    }).when("/login",{
        templateUrl:"Contents/login.html"
    }).otherwise({redirectTo:'/'})
});

app.controller("taskController", function($scope,$location,$http,$interval,$window,projectService,taskService,userService) {



    $scope.newTask={};
    $scope.user={
        id:userService.getUser().id,
        project:[]
    }

    $scope.editTask={};

    //Reimprospateaza pagina la fiecare secunda
    $interval(function(){
        $scope.changeProgressBar();
    }, 1000)

    $scope.changeProgressBar=function(){
        for(var i=0;i<$scope.user.project.length;i++){
            var totalTime=calculateRemainingDays($scope.user.project[i].start_time,$scope.user.project[i].finish_time);
            var remainingDays=$scope.showRemaingingDays($scope.user.project[i]);
            remainingDays=remainingDays.substring(0,remainingDays.indexOf(" "));
            var percent=((totalTime-remainingDays)*100)/totalTime;
            $scope.user.project[i].percent="width:"+percent+"% !important";
        }
    }

    $scope.checkIfProjectCompleted=function(project){
        var checked=true;
        for(var i=0;i<project.task.length;i++){
            if(project.task[i].state==0){
                checked=false;
            }
        }

        for(var i=0;i<$scope.user.project.length;i++){
            if($scope.user.project[i].id==project.id){
                if(checked)
                    $scope.user.project[i].state=1;
                else 
                    $scope.user.project[i].state=0;
                break;
            }
        }

        if(checked==true)
            project.state=1;
        else
            project.state=0;

        var statusRequest={
            method: 'PUT',
            url: 'http://localhost:8080/TaskManagement/api/project/'+project.id,
            headers: {
                'Content-Type': 'application/json'
            },
            data:{ 
                state:project.state
            }
        }
        $http(statusRequest).then(function succes() {
            console.log("a mers");
        }, function error() {
            alert("Incorect Name or Password");
        })

        //TODO : update project here (http)
    };

    //-1 no modal show
    //1 show create task modal
    //2 show edit taks modal
    //...
    $scope.modalState=-1;
    $scope.changeModalState=function(val){
        $scope.modalState=val;
        if($scope.modalState >0)
            document.getElementById("modal").style.display="block";
        else
            document.getElementById("modal").style.display="none";
    };


    $scope.showCreateTaskModal=function(project){
        $scope.newTask.project=project;
        $scope.changeModalState(1);
    }

    $scope.createTask=function(task){
        var taskDTO={};
        taskDTO.name=task.name;
        taskDTO.description=task.description;
        taskDTO.state=0;
        taskDTO.assigned_to={};
        taskDTO.assigned_to.id=task.assignTo.id;
        taskDTO.created_by=userService.getUser().id;
        taskDTO.project_id=task.project.id;
        taskService.createTask(taskDTO,(data)=>{
            for(var i=0;i<$scope.user.project.length;i++){
                if($scope.user.project[i].id==data.project_id){
                    $scope.user.project[i].task.push(data);
                    $scope.user.project[i].state=0;
                }
            }

        });
        $scope.changeModalState(-1);
    }


    $scope.populateGant=function(project){
        var tasks={data:[]};
        var proj={};

        proj.id=project.id;
        proj.text=project.name;
        proj.duration=calculateRemainingDays(project.start_time,project.finish_time);
        proj.start_date=changeDateFormat(project.start_time);
        tasks.data.push(proj); //add project to gantt

        //iterate over all task of the project
        for(var j=0;j<project.task.length;j++){
            //take only the task that are assigned to current user
            if(project.task[j].assigned_to.id==$scope.user.id){
                //if the task doesn't have start time ... skip it
                if(!project.task[j].start_time){
                    continue;
                }

                var task={};
                task.id=proj.id+"#"+project.task[j].id;
                task.text=project.task[j].name;
                task.duration=calculateRemainingDays(project.task[j].start_time,project.task[j].finish_time);
                task.start_date=changeDateFormat(project.task[j].start_time);
                task.parent=proj.id; //set task parent to the current project
                tasks.data.push(task); // add task to gantt
            }
        }
        gantt.parse(tasks);

    }

    $scope.projectOk=false;
    $scope.showGant=function(){


        gantt.init("gantt");
        gantt.clearAll();
        for(var i=0;i<$scope.user.project.length;i++){
            taskService.getTasksForProject($scope.user.project[i].id,(data,projectId)=>{
                for(var j=0;j<$scope.user.project.length;j++){
                    if($scope.user.project[j].id==projectId){
                        $scope.user.project[j].task=data;
                        $scope.populateGant($scope.user.project[j]);
                    }
                }

            })
        }

    };

    projectService.getProjectsForUser(userService.getUser().id,(data) => {
        $scope.user.project=data;
        if(document.getElementById("gantt")){
            $scope.showGant();
        }
    });



    // Functie utilizata la schimbarea statusului unui task in baza de date 
    $scope.checkboxFunction=function(task,state){
        task.state=state;
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

    //DELETE TASK
    $scope.deleteTask=function(task){
        if(confirm("Are you sure you want to delete the "+task.name+" task?")){
            var deleteRequest={
                method: 'DELETE',
                url: 'http://localhost:8080/TaskManagement/api/task/'+task.id,
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            $http(deleteRequest).then(function succes() {
                for(var i=0;i<$scope.user.project.length;i++){
                    for(var j=0;j<$scope.user.project[i].task.length;j++){
                        if($scope.user.project[i].task[j].id==task.id){
                            $scope.user.project[i].task.splice(j,1);
                        }
                    }
                }
            }, function error() {
                alert("Incorect Name or Password");
            })}
        else{
            return;
        }

    };

    $scope.uneditedTask={};

    $scope.fillEditTaskModal=function(task){
        $scope.uneditedTask=task;
        $scope.editTask.id=task.id;
        $scope.editTask.project=$scope.user.project[$scope.getProjectIndex(task)];
        $scope.editTask.name=task.name;
        $scope.editTask.description=task.description;
        $scope.editTask.assignTo=$scope.editTask.project.projectUser[$scope.getUserIndex($scope.editTask.project,task.assigned_to.id)];
    }

    $scope.getUserIndex=function(project,userId){
        for(var i=0;i<project.projectUser.length;i++){
            if(project.projectUser[i].id==userId){
                return i;
            }
        }
    };

    $scope.getProjectIndex=function(task){
        //project_id
        for(var i=0;i<$scope.user.project.length;i++){
            if($scope.user.project[i].id==task.project_id)
                return i;
        }
    }

    //UPDATE TASK
    $scope.updateTask=function(task){  

        var taskDTO={};
        taskDTO.assigned_to={};
        taskDTO.assigned_to.id=task.assignTo.id;
        taskDTO.name=task.name;
        taskDTO.description=task.description;
        taskDTO.project_id=task.project.id;

        var moveTask={};
        var UpdateRequest={
            method: 'PUT',
            url: 'http://localhost:8080/TaskManagement/api/task/'+task.id,
            headers: {
                'Content-Type': 'application/json'
            },
            data:taskDTO
        }

        $http(UpdateRequest).then(function succes() {

            for(var i=0;i<$scope.user.project.length;i++){
                for(var j=0;j<$scope.user.project[i].task.length;i++){
                    if($scope.user.project[i].task[j].id==task.id){
                        $scope.user.project[i].task[j].assigned_to.id=task.assignTo.id;
                        $scope.user.project[i].task[j].name=task.name;
                        $scope.user.project[i].task[j].description=task.description;
                    }
                }
            }


        }, function error() {
            alert("Incorect Name or Password");
        })

        $scope.changeModalState(-1);
    };

    //zilele ramase la fiecare project
    $scope.showRemaingingDays=function(project){
        if(!project.finish_time){
            return;
        }
        project.finish_time=project.finish_time.substring(0,20);
        var finishDate=new Date(project.finish_time);//Data pana la care trebuie sa fie terminat proiectul 
        var curentDate=new Date();                    //Data curenta
        var timeDiff = finishDate.getTime() - curentDate.getTime();    //diferenta intre cele 2 date
        var diffDays;
        if(project.state==1){
            return "Completed";
        }
        if(timeDiff>0)
        {
            diffDays = Math.ceil(Math.abs(timeDiff) / (1000 * 3600 * 24));  //se afla diferenta in zile
            return diffDays +" days";
        }
        return "Expired";

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
            if(project[index].state==0)
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
            if(project[index].state==1)
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
            timeDiff = finishDate.getTime() - curentDate.getTime(); 
            if(timeDiff<0){
                continue;
            }
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
            return "Incomplete";
        }
        else if(task.state==1){
            return "Completed";
        }
        else{
            return "Expired";
        }
    };

    //###################   Pentru Diagrama  ############################
    //###################################################################
    /*
    $scope.taskDashboard=true;
    $scope.taskManagement=false;

    //Functie folosita pentru a schimba care dintre cele 2 directive va fii vizualizata de client
    $scope.taskDashboardFunction=function(task){
        $scope.taskDashboard=true;
        $scope.taskManagement=false;
    };

    //Functie folosita pentru a schimba care dintre cele 2 directive va fii vizualizata de client
    $scope.taskManagementFunction=function(task){
        $scope.taskDashboard=false;
        $scope.taskManagement=true;
    }; */

    //Trimite schimbarile din diagrama la server
    $scope.applyGanttChanges=function(){
        //take all the tasks from gantt chart and
        // send them to the server to be updated
        for(var i=0;i<$scope.user.project.length;i++)
        {
            gantt.eachTask(function(task){
                console.log(task);
                var id=task.id.substring(task.id.indexOf("#")+1,task.id.length);
                var updateTaskRequest={
                    method: 'PUT',
                    url: 'http://localhost:8080/TaskManagement/api/task/'+id,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data:{ 
                        name:task.name,
                        start_time:changeDateForDataBase(task.start_date,task.duration).startDate,
                        finish_time:changeDateForDataBase(task.start_date,task.duration).finishDate
                    }
                }

                $http(updateTaskRequest).then(function succes() {

                }, function error() {
                    alert("Incorect Name or Password");
                });

            },$scope.user.project[i].id)
        }
    }

    $scope.checkIfLogin=function(){
        if(!userService.getUser().id){
            $location.path ('/login');
        }
    };


});


//Functie care transforma secundele in ore, minute si secunde
function secondsToHms(d) {
    d = Number(d);
    //Math.floor takes a float and rounds down.
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return h + ":"+ m + ":" + s; 
};

//Functie care schimba formatul datei pentru a fii folosita in diagrama
function changeDateFormat(date){
    //2018-12-11
    var days=date.substring(8,10);
    var month=date.substring(5,7);
    var year=date.substring(0,4);
    var newDate=days+"-"+month+"-"+year;
    return newDate;
};

//Functie care returneaza un obiect cu data de inceput si de sfarsit al unui task
function changeDateForDataBase(date,duration){
    //11-12-2018
    if(!date){
        return ;
    }
    var miliseconds=date.getTime()+(duration * 1000 * 3600 * 24);
    var newDate=new Date(miliseconds);
    var object={};
    object.startDate=changeDateForDatabase(date);
    object.finishDate=changeDateForDatabase(newDate);

    return object;
};

//Functie care calculeaza durata unui task
function calculateRemainingDays(from,to){
    //2018-12-11T22:00:00Z[UTC]
    if(!to){
        return 1;
    }

    from=from.substring(0,20);
    to=to.substring(0,20);
    from=new Date(from);
    to=new Date(to);
    return Math.ceil(to.getTime()-from.getTime())/(1000 * 3600 * 24);
};

//Functie care schimba formatul datei pentru a fii trimisa la server
function changeDateForDatabase(date){
    var days=date.getDate();
    var month=date.getMonth()+1;  /// January is 0
    var year=date.getFullYear();
    if (days < 10) {
        days = '0' + days;
    } 
    if (month < 10) {
        month = '0' + month;
    } 
    return year+"-"+month+"-"+days+"T00:00:00Z[UTC]";
}


app.controller("loginController", function($scope,$location,$http,$interval,$window,projectService,taskService,userService) {

    $scope.user={
        project:[]
    }

    $scope.user.name=userService.getUser().name;

    $scope.name;
    $scope.password;


    $scope.logout=function(){
        userService.logout();
    }

    $scope.loginFunction=function(){
        userService.login($scope.name,$scope.password,(data) => {
            $scope.user.id=data.id;
            $scope.user.name=data.name;
            $location.path ('/projects');
        });
    }

    $scope.checkUserLogin=function(){
        if(userService.getUser==0)
            return true;

        if(userService.getUser().id){
            $scope.user.name=userService.getUser().name;
            return true;

        }
        return false;
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
        templateUrl: './Directives/modal.html'
    };
})
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

    this.logout=function(){
        user.id=null;
    }

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
            callback(response.data,projectId);
        }, function error() {
            alert("Incorect Name or Password");
        })};

    this.createTask =function (task,callback) {
        var req = {
            method: 'POST',
            url: 'http://localhost:8080/TaskManagement/api/task',
            headers: {
                'Content-Type': 'application/json'
            },
            data:task
        };
        $http(req).then(function succes(response) {
            callback(response.data);
        }, function error() {
            alert("Incorect Name or Password");
        })};
}]);
