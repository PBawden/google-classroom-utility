var request = require('superagent');
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
    index = readlineSync.keyInSelect(names, "Which class?");
    var selected = classList[index];
    request.get(url + "?method=getStudents&courseId=" + selected.id).end(function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res.body);
      }
    });
  }
});
