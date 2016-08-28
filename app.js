var fs = require('fs');
var path = require('path');

var request = require('superagent');

var utils = require('./db/utils');
var parse = require('./parse');
var keys = require('./db/keys');

var FuzzyMatching = require('fuzzy-matching');
var readlineSync = require('readline-sync');
var urlencode = require('urlencode');
console.log("Welcome to the Google Classroom utility.");
console.log("After the class list loads, you will find options.");

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
    var fm = new FuzzyMatching([selected.name]);
    var currKey = keys.filter(function(obj) {
      var match = fm.get(obj.fullName);
      return match.distance >= 0.5;
    });
    var collectionName = currKey[0].collection;
    var mainMenu = [
      'Update Student List',
      'Initial Assignment Upload',
      'Update Existing Assignment',
      'Append Additional Data',
      'Parse CSV File'
    ];
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
          utils.findNewStudents(collectionName, students, function(arr) {
            if(arr.length>0) {
              // do something to insert new students
              utils.insertNewStudents(arr, collectionName, function() {
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
              var counter = submissions.length;
              var tek = readlineSync.question("Which TEK should this be coded as?");
              submissions.forEach(function(submission) {
                utils.initialUpload(submission, tek, download.title, collectionName, function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    counter --;
                    console.log("Inserted grade for " + submission.userId);
                    if (counter === 0) {
                      process.exit();
                    }
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
              var counter = submissions.length;
              submissions.forEach(function(submission) {
                utils.assignmentUpdate(submission, collectionName, function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    counter --;
                    console.log("Updated grade for " + submission.userId);
                    if (counter === 0) {
                      process.exit();
                    }
                  }
                });
              });
            }
          });
        }
      });
    } else if (main === 3) {
      console.log("About to append internal Skyward IDs for each student.");
      console.log("Please make sure there is a file named studentData.json");
      console.log("in this project's directory.  The required fields are: ");
      console.log('"email", "internalId", "skywardFirst", "skywardLast", "skywardFull" and "cohort"');
      utils.appendData(collectionName, function() {
        console.log("Success!");
        process.exit();
      });
    } else if (main === 4) {
      console.log("Finding files in download folder with extension csv");
      fs.readdir('/Users/teacher/Downloads', function(err, contents) {
        if (err) {
          console.log(err);
        } else {
          var csvFiles = [];
          contents.forEach(function(content) {
            if (path.extname(content) === ".csv") {
              csvFiles.push(content);
            }
          });
          if (csvFiles.length < 1) {
            console.log("No CSV files found to parse!");
            process.exit();
          }
          var pickCSV = readlineSync.keyInSelect(csvFiles, 'Which file would you like to parse?');
          var fullPath = '/Users/teacher/Downloads/' + csvFiles[pickCSV];
          parse.extractHeader(fullPath, function(_event) {
            utils.getAssignments(collectionName, function(docs) {
              var assignmentNames = [];
              docs.forEach(function(doc) {
                assignmentNames.push(doc.title);
              });
              var pickAssignment = readlineSync.keyInSelect(assignmentNames, 'Which assignment would you like to use?');
              var picked = docs[pickAssignment];
              var fm = new FuzzyMatching([picked.title]);
              var match = fm.get(_event.title);
              if (match.distance < 0.6) {
                console.log("The titles do not seem to match...");
                console.log("The parsed title from the CSV file is " + _event.title + ".");
                console.log("The title from the database is " + match.value);
                if (readlineSync.keyInYN('Do you want to abort?')) {
                  process.exit();
                }
              }

              var newFileLines = _event.header;
              utils.getGrades(collectionName, picked.courseWorkId, _event.cohort, function(docs) {
                docs.forEach(function(doc) {
                  newFileLines.push(
                  `"${doc.internalId}","${doc.skywardFirst} ${doc.skywardLast}","","${doc.grade || 0}","","","",""`);
                });
                var ready = "";
                newFileLines.forEach(function(line) {
                  ready += line;
                  ready += '\n';
                });
                var newFileName = _event.title + "_" + _event.cohort + ".csv";
                fs.writeFile(newFileName, ready, function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Done! REMEMBER: max points must match!!!");
                    fs.unlinkSync(fullPath);
                    process.exit();
                  }
                });
              });
            });
          });
        }
      });
    }
  }
});
