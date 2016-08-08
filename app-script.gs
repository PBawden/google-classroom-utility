// This is the web app that runs on Google Apps Script

Object.assign = function(target) {
  'use strict';
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  target = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index];
    if (source != null) {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
};

function doGet(request) {
if (request.parameter.method === 'getClasses') {
    return ContentService.createTextOutput(JSON.stringify(getClasses()))
    .setMimeType(ContentService.MimeType.JSON);
} else if (request.parameter.method === 'getStudents') {
    return ContentService.createTextOutput(JSON.stringify(getStudents(request.parameter.courseId)))
    .setMimeType(ContentService.MimeType.JSON);
} else if (request.parameter.method === "getAssignments") {
    return ContentService.createTextOutput(JSON.stringify(getAssignments(request.parameter.courseId)))
    .setMimeType(ContentService.MimeType.JSON);
} else if (request.parameter.method === "getSubmissions") {
    return ContentService.createTextOutput(JSON.stringify(getSubmissions(request.parameter.courseId, request.parameter.courseWorkId)))
    .setMimeType(ContentService.MimeType.JSON);
}
}

function getClasses() {
var rtnClasses = [];
var classes = Classroom.Courses.list().courses;
var rtnClasses = [];
classes.forEach(function(class) {
  if (class['courseState'] == 'ACTIVE') {
    var empty = {};
    empty.name = class['name'];
    empty.id = class['id'];
    rtnClasses.push(empty);
  }
});
return rtnClasses;
}

function getStudents(courseId) {
var optionalArgs = {
  pageSize: 10
}
var studentObjs = [];
for (var i=0; i<8; i++) {
  var response = Classroom.Courses.Students.list(courseId, optionalArgs);
  optionalArgs.pageToken = response.nextPageToken;
  var students = response.students;
  students.forEach(function(student) {
    var blank = {};
    blank.email = student.profile.emailAddress;
    blank.firstName = student.profile.name.givenName;
    blank.lastName = student.profile.name.familyName;
    blank.fullName = student.profile.name.fullName;
    blank.userId = student.userId;
    studentObjs.push(blank);
  })
}
return (studentObjs);
}

function getAssignments(courseid) {
var optionalArgs = {
  pageSize: 10
}
var assignmentList = Classroom.Courses.CourseWork.list(courseid, optionalArgs).courseWork;
var assignmentObjs = [];
assignmentList.forEach(function(assign) {
  if (assign.workType === 'ASSIGNMENT') {
    var blank = {};
    blank.id = assign.id;
    blank.title = assign.title;
    blank.creationTime = assign.creationTime;
    blank.maxPoints = assign.maxPoints;
    blank.dueDate = assign.dueDate;
    assignmentObjs.push(blank);
  }
});
return assignmentObjs;
}


function getSubmissions(courseId, courseWorkId) {
var optionalArgs = {
  pageSize: 10
}
var submissionObjs = [];
for (var i=0; i<8; i++) {
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId,courseWorkId , optionalArgs);
  optionalArgs.pageToken = response.nextPageToken;
  var submissions = response.studentSubmissions;
  submissions.forEach(function(submission) {
    var blank = {};
    blank.draftGrade = submission.draftGrade;
    blank.state = submission.state;
    blank.courseWorkId = submission.courseWorkId;
    blank.userId = submission.userId;
    blank.assignedGrade = submission.assignedGrade;
    submissionObjs.push(blank);
  })
}
return submissionObjs;
}
