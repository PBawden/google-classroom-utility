var request = require('superagent');
var utils = require('./db/utils');
var readlineSync = require('readline-sync');
var urlencode = require('urlencode');

var url = "https://script.google.com/macros/s/AKfycbzGmvkUXGTvNK0ChTl9EMk9BenhwbtLHrjRjbaPauIW5CNblb0/exec";
console.log("Loading class lists...");
// kick off the fun by getting a class list
// choke off most of the object
var partial = urlencode("fields=courseState,name,id");
request.get(url + "?method=getClasses&" + partial).end(function(err, res) {
  if (err) {
    if (err.code == 'EAI_AGAIN') {
      console.log("Google server error.  Try again.");
      process.exit();
    }
  } else {
    var classList = res.body;
    var names = [];
    classList.forEach(function(gclass) {
      names.push(gclass.name);
    });
    var index = readlineSync.keyInSelect(names, "Which class?");
    var selected = classList[index];
    var mainMenu = ['Update Student List', 'Initial Assignment Upload', 'Update Existing Assignment'];
    var main = readlineSync.keyInSelect(mainMenu, 'Which action would you like to take?');
    /* selection 0 is Update Student List */
    if (main === 0) {
      console.log("Getting student data, may take awhile...");
      // choke student object
      var partial = urlencode("fields=profile, userId");
      request.get(url + "?method=getStudents&courseId=" + selected.id + "&" + partial).end(function(err, res) {
        if (err) {
          if (err.code == 'EAI_AGAIN') {
            console.log("Google server error.  Try again.");
            process.exit();
          }
        } else {
          var students = res.body;
          utils.findNewStudents('algebra2', students, function(arr) {
            if(arr.length>0) {
              // do something to insert new students
              utils.insertNewStudents(arr, 'algebra2', function() {
                console.log("Successfully inserted " + arr.length + " new students.");
                process.exit();
              });
            } else {
              console.log("Student list is up to date!");
              process.exit();
            }
          });
        }
      });
    } else if (main === 1) {
      console.log("Getting student data...");
      request.get(url + "?method=getAssignments&courseId=" + selected.id).end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success...");
          var assignments = res.body;
          var assignmentNames = [];
          assignments.forEach(function(assignment) {
            assignmentNames.push(assignment.title);
          });
          var index = readlineSync.keyInSelect(assignmentNames, "Which assignment would you like to download?");
          var download = assignments[index];
          console.log("Getting submissions...");
          request.get(url + "?method=getSubmissions&courseId=" + selected.id + "&courseWorkId=" + download.id).end(function(err, res) {
            if (err) {
              console.log(err);
            } else {
              var submissions = res.body;
              var tek = readlineSync.question("Which TEK should this be coded as?");
              submissions.forEach(function(submission) {
                utils.initialUpload(submission, tek, download.title, 'algebra2', function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Inserted grade for " + submission.userId);
                  }
                });
              });
            }
          });
        }
      });
    } else if (main === 2) {
      console.log("Getting student data...");
      request.get(url + "?method=getAssignments&courseId=" + selected.id).end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success...");
          var assignments = res.body;
          var assignmentNames = [];
          assignments.forEach(function(assignment) {
            assignmentNames.push(assignment.title);
          });
          var index = readlineSync.keyInSelect(assignmentNames, "Which assignment would you like to download?");
          var download = assignments[index];
          console.log("Getting submissions...");
          request.get(url + "?method=getSubmissions&courseId=" + selected.id + "&courseWorkId=" + download.id).end(function(err, res) {
            if (err) {
              console.log(err);
            } else {
              var submissions = res.body;
              submissions.forEach(function(submission) {
                utils.assignmentUpdate(submission, 'algebra2', function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Updated grade for " + submission.userId);
                  }
                });
              });
            }
          });
        }
      });
    }
  }
});
