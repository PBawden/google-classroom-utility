var request = require('superagent');
var findNewStudents = require('./db/findNewStudents');
var readlineSync = require('readline-sync');

var url = "https://script.google.com/macros/s/AKfycbzGmvkUXGTvNK0ChTl9EMk9BenhwbtLHrjRjbaPauIW5CNblb0/exec";
console.log("Loading class lists...");
// kick off the fun by getting a class list
request.get(url + "?method=getClasses").end(function(err, res) {
  if (err) {
    console.log(err);
  } else {
    var classList = res.body;
    var names = [];
    classList.forEach(function(gclass) {
      names.push(gclass.name);
    });
    var index = readlineSync.keyInSelect(names, "Which class?");
    var selected = classList[index];
    var mainMenu = ['Update Student List'];
    var main = readlineSync.keyInSelect(mainMenu, 'Which action would you like to take?');
    /* selection 0 is Update Student List */
    if (main === 0) {
      console.log("Getting student data, may take awhile...");
      request.get(url + "?method=getStudents&courseId=" + selected.id).end(function(err, res) {
        if (err) {
          console.log(err);
        } else {
          var students = res.body;
          findNewStudents(students, function(newStudents) {
            console.log(newStudents);
          })
        }
      });
    }
    // async.parallel([
    //   function(callback) {

    //   },
    //   function(callback) {
    //     request.get(url + "?method=getAssignments&courseId=" + selected.id).end(function(err, res) {
    //       if (err) {
    //         console.log(err);
    //       } else {
    //         console.log("Got assignment data...");
    //         var assignments = res.body;
    //         callback(null, assignments);
    //       }
    //     });
    //   }
    // ], function(err, results) {
    //   var assignmentList = results[1];
    //   var names = [];
    //   assignmentList.forEach(function(assignmment) {
    //     names.push(assignmment.title);
    //   });
    //   var index = readlineSync.keyInSelect(names.slice(0, 9), "Which assignment?");
    //   console.log(assignmentList[index]);
    // });
  }
});
