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
  findNewStudents: function(collection, studentArray, callback) {
      var newStudents = [];
      this.getCurrentStudents(collection, function(results) {
        if (!results) {
          studentArray.forEach(function(student) {
            var copy = Object.assign({}, student);
            copy.work = {};
            newStudents.push(copy);
          });
          callback(newStudents);
        } else {
          for (var i=0; i<studentArray.length; i++) {
            var found = false;
            for (var j=0; j<results.length; j++) {
              if (studentArray[i].userId == results[j].userId) {
                found = true;
              }
            }
            if (!found) {
              var copy = Object.assign({}, studentArray[i]);
              copy.work = [];
              newStudents.push(copy);
            }
          }
          callback(newStudents);
        }
      });
  },
  insertNewStudents: function(newStudents, collection, callback) {
    MongoClient.connect(config.uri, function(err, db) {
      if (err) {
        console.log(err);
      } else {
        console.log("Connected...");
        db.collection(collection).insertMany(newStudents, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            callback();
          }
        });
      }
    });
  },
  initialUpload: function(newWork, tek,collection, callback) {
    MongoClient.connect(config.uri, function(err, db) {
      if (err) {
        console.log(err);
      } else {
        var copy = Object.assign({}, newWork);
        copy.tek = tek;
        db.collection(collection).update(
          {userId: copy.userId},
          {$addToSet: {work: copy}},
          function(err) {
            if (err) {
              console.log(err);
            } else {
              callback();
            }
          }
        );
      }
    });
  },
  assignmentUpdate: function(updateWork, collection, callback) {
    MongoClient.connect(config.uri, function(err, db) {
      if (err) {
        console.log(err);
      } else {
        db.collection(collection).update(
          {userId: updateWork.userId, work: {courseWorkId: updateWork.courseWorkId}},
          {$set: {"work.$.assignedGrade" : updateWork.assignedGrade}}, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Success!");
          }
        });
      }
    });
  }

};
