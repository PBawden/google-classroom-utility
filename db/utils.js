var MongoClient = require("mongodb").MongoClient;
var config = require('./config');

module.exports = {
  getCurrentStudents: function(collection, callback) {
    MongoClient.connect(config.uri, function(err, db) {
      if (err) {
        console.log(err);
      } else {
        db.collection(collection).find().toArray(function(err, docs) {
          if (err) {
            console.log(err);
          } else {
            callback(docs);
          }
        });
      }
    });
  },
  findNewStudents: function(collection, studentArray) {
      this.getCurrentStudents(collection, function(results) {
        console.log(results);
        if (!results) {
          studentArray.forEach(function(student) {
            var copy = Object.assign({}, student);
            copy.work = {}
            newStudents.push(copy);
          })
          console.log(newStudents);
        } else {
          for (var i=0; i<studentArray.length; i++) {
            console.log("New ID")
            console.log("====================================")
            console.log(studentArray[i].userId);
            console.log(typeof studentArray[i].userId);
            var found = false;
            for (var j=0; j<results.length; j++) {
              console.log(results[j].userId);
              console.log(typeof results[j].userId);
            }
          }
        }
      })
  }
}
