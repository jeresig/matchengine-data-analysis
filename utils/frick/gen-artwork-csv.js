var es = require("event-stream");

var map = {};

process.stdin
    .pipe(es.split("\n"))
    .on("data", function(data) {
        var file = data.trim().replace(/.jpg/, "");

        if (!file) {
            return;
        }

        var id = /^\d+/.exec(file)[0];

        if (!map[id]) {
            map[id] = [];
        }

        map[id].push(file);
    })
    .on("close", function() {
        Object.keys(map).sort().forEach(function(id) {
            console.log([id].concat(map[id]).join(","));
        });
    });