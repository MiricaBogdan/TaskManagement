var app = angular.module("timeManagementApp", []); 
app.controller("myCtrl", function($scope,$http,$interval) {

    //Reimprospateaza pagina la fiecare secunda
    $scope.user=user;
  $interval(function(){
       }, 1000)
    
    
    //Buton pentru afisarea si ascunderea taskurilor dintr-un story
    $scope.hideAndShow=false;
    $scope.$watch('hideAndShow',function() {
    $scope.buttonValue=$scope.hideAndShow ? 'Hide the Tasks' : 'Show the Tasks';  //?? I am not very sure how this line works 
    });
    
    // I made another try but stil dont work 
    /*
     if($scope.hideAndShow==false){
        $scope.buttonValue="Show the tasks";    
    } 
    else{
        $scope.buttonValue="Hide the tasks";  
    }});*/
    
    
    //zilele ramase la fiecare story
    $scope.showRemaingingDays=function(story){
      var finishDate=new Date(story.finish_time);   //Data pana la care trebuie sa fie terminat proiectul
      var curentDate=new Date();                    //Data curenta
      var timeDiff = Math.abs(finishDate.getTime() - curentDate.getTime());    //diferenta intre cele 2 date
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));                 //se afla diferenta in zile
      return diffDays +" days";
        
      
    };
    
    
    //numarul story care sunt active
   $scope.activeStoryNumber=function(story){  
      var index;
      var activeStoryNumber=0;
      for (index=0;index<story.length;++index)
          {
              activeStoryNumber++;
          }
     return activeStoryNumber;
  };
   
    //numarul de story care sunt terminate
   $scope.completedStoryNumber=function(story){
      var index;
      var completedStoryNumber=0;
      for (index=0;index<story.length;++index)
          {
              if(story.state==1)
                  {
                      completedStoryNumber++;
                  }
          }
     return completedStoryNumber;
   };
    
    //timpul pana la expirarea primului story
    $scope.criticalStory=function(story){
      var index;   // index folosit la parcurgerea array de story
      var min;   // valoarea cea mai mica de timp pana la expirarea unui story si care va fii initial primul element din array
      var minIndex=0; // indexul story-ului care va expira primul si care e initial            
      var finishDate=new Date(story[0].finish_time);   //Data pana la care trebuie sa fie terminat proiectul pentru primul elemement
      var curentDate=new Date();                    //Data curenta
      var timeDiff; // diferenta dintre data de sfarsit si data curenta
      var seconds;    
        
      min=Math.abs(finishDate.getTime() - curentDate.getTime());          
        
      // se parcurge array de story incepand de la al doilea    
      for(index=1;index<story.length;++index)    
          {
              finishDate=new Date(story[index].finish_time);
              curentDate=new Date(); 
              timeDiff = Math.abs(finishDate.getTime() - curentDate.getTime()); 
              if(timeDiff<min)
                  {
                      min=timeDiff;
                      minIndex=index;
                  }
              
          }
      finishDate=new Date(story[minIndex].finish_time);
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

    //Functie care transforma secundele in ore, minute si secunde
    function secondsToHms(d) {
    d = Number(d);
        //Math.floor takes a float and rounds down.
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return h + ":"+ m + ":" + s; 
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