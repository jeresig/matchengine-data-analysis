var fs = require("fs");
var path = require("path");

var file = process.argv[2];

var parseName = function(file) {
    /(\w+)\/(\w+).jpg/.test(file);
    return {
        source: RegExp.$1 === "italian" ? "frick" : RegExp.$1,
        id: RegExp.$2
    };
};

var data = require(path.resolve(file));

Object.keys(data).forEach(function(image) {
    var from = parseName(image);

    data[image].forEach(function(match) {
        var to = parseName(match.filepath);

        console.log([from.source, from.id, to.source, to.id,
            match.query_overlap_percent, match.score].join(","));
    });
});