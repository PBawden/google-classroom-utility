var MongoClient = require("mongodb").MongoClient;
var config = require('./config');

var findNewStudents = function(studentArray, callback) {
  var newStudents = [];
  MongoClient.connect(config.uri, function(err, db) {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected...");
      console.log("Getting a list of existing students...")
      db.collection('grades').find({}, function(err, docs) {
        if (err) {
          console.log(err);
        } else {
          var userIdList = [];
          docs.forEach(function(doc) {
            userIdList.push(doc.userId);
          })
          console.log("Got the list, now comparing...");
          studentArray.forEach(function(student) {
            if (student.userId in userIdList) {
              console.log(student.fullName + " is in the list");
            } else {
              console.log(student.fullName + " is not in the list");
              var copy = Object.assign({}, student);
              copy.work = {};
              newStudents.push(copy);
            }
          });
          callback(newStudents);
        }
      })
    }
  })
}

module.exports = findNewStudents;
