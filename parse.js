var fs = require('fs');

module.exports = {
  extractHeader: function(csvFile, callback) {
    var _event = {};

    fs.readFile(csvFile, {encoding:'utf-8'}, function(err, contents) {
      if (err) {
        console.log(err);
      } else {
        var delim = contents.split('\r');
        var header = delim.slice(0, 7);

        _event.header = header;

        var gradebookRow = delim[0].split(',');
        var info = gradebookRow[1].split(' ');
        _event.abbrev = info[0].slice(1);
        _event.cohort = delim[0].slice(23, 24);
        _event.grade = delim[0].slice(18, 20)

        var eventRow = delim[2].split(",");
        _event.title = eventRow[1].slice(1,-1);

        var classRow = delim[3].split(',');
        _event.course = classRow[1].slice(1,-1);
      }
      callback(_event);
    });
  }
}
