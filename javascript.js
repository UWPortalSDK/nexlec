angular.module('portalApp')
.controller('nexlecCtrl', ['$scope', '$http', function ($scope, $http) {
    const apikey = "fd2948fdde9149cf94c403b3c64d325d"; 
    var coursesUrl = '/Develop/GetProxy?url=https://api.uwaterloo.ca/v2/courses/';
    
    $scope.showTuts = false;
    $scope.tutTogText = $scope.showTuts ? "Hide Tutorials" : "Show Tutorials";
    $scope.toggleShowTuts = function () {
    	$scope.showTuts = !$scope.showTuts;
        $scope.tutTogText = $scope.showTuts ? "Hide Tutorials" : "Show Tutorials";
    };
    
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    
	$scope.items = [];
	
	// Show main view in the first column as soon as controller loads
	$scope.portalHelpers.showView('nexlecMain.html', 1);
	
	// This function gets called when user clicks an item in the list
	$scope.showLecList = function(course){
        console.log("CLICKED course", course);
                	$scope.courses = [];

        if (course.sub && course.num) {
            $http.get(coursesUrl +`${course.sub}/${course.num}/schedule.json?key=` + apikey)
                .success(function(data) {
                console.log("data.data: ", data.data);
                classes = data.data
                    .filter(function (lecClass) {
                        return lecClass.section.contains("LEC") || (lecClass.section.contains("TUT") && $scope.showTuts);
                    })
                    .map(function (lecClass) {
                    classesArr = lecClass.classes[0];
                    console.log("classesArr", classesArr);
                        return {
                            "details": lecClass,
                        "prof": classesArr.instructors[0] ? classesArr.instructors[0].split(",")[1] + " " +
                            					classesArr.instructors[0].split(",")[0] : "Tutorial",
                            "loc": classesArr.location ? classesArr.location.building + " " +
                            						classesArr.location.room : "NOPE",
                            
                            "times": classesArr.date ? (classesArr.date.start_time + " - " + classesArr.date.end_time + " | " + classesArr.date.weekdays) : "Online",
                            sectionNum: lecClass.section,
                            "numStars" : [1,1,1,1,1]
                    };
                    });

                    console.log("CLASSES", classes);
                	$scope.courses = classes;
            		console.log("$scope.courses", $scope.courses);
                });
        }


		// Make the item that user clicked available to the template
		$scope.detailsItem = course;		
		$scope.portalHelpers.showView('nexlecList.html', 2);
	};
    
    
    $scope.showLecDetails = function(item) {
        console.log("showLecDetails", item.details, item);
        
        $scope.coursesItem = item;
        $scope.lecDetails = item.details;
		$scope.portalHelpers.showView('nexlecDetails.html', 3);
    };
    
    
    
    
    // get lectures of other course section schedules (probably should fix cz callback hell)
    $scope.portalHelpers.getApiData('student/CurrentTermCode').then(function (result) {
    	const curCode = result.data;
        
        $scope.portalHelpers.getApiData('student/Courses2').then(function (result) {
            console.log("COURSES2", result);
            courses = result.data.courseEnrollmentData;
            
            curCourses = courses
                .filter(function(course) {
            		return course.termCode === curCode && course.courseComponent == "LEC";
            	})
            	.map(function(course) {
            		return {"sub": course.courseSubject,
                            "num": course.courseCatalogNumber,
                            "title": course.courseSubject + " " +
                            			course.courseCatalogNumber,
                            "tags": [],
                           "details": course};
                });
                
                curCourses.forEach(function (course) {
                    $scope.items.push(course);                    
                });
            
            console.log("$scope.items: ", $scope.items);
            
    
        });
        
        
	});
}]);