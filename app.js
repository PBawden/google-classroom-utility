var request = require('superagent');
var utils = require('./db/utils');
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
          utils.findNewStudents('algebra2', students);
        }
      });
    }
  }
});
