var fs = require('fs');

module.exports = {
  extractHeader: function(csvFile) {
    var _event = {};

    fs.readFile(csvFile, {encoding:'utf-8'}, function(err, contents) {
      if (err) {
        console.log(err);
      } else {
        var delim = contents.split('\r');
        var header = delim.slice(0, 7);

        _event.header = header;

        var eventRow = delim[2].split(",");
        _event.title = eventRow[1];

        var classRow = delim[3].split(',');
        _event.course = classRow[1];
      }
      return(_event);
    });
  }
}
