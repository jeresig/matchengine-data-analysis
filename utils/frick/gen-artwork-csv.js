var csv = require("csv-streamify");
var yr = require("yearrange");

var dates = {};

process.stdin
    .pipe(csv({
        objectMode: true,
        delimiter: "\t",
        columns: true
    }))
    .on("data", function(data) {
        var path = (data["PATH"] || "").trim();
        var date = data["WORK DATE"];

        if (/([^\/]+).tif/.test(path)) {
            path = RegExp.$1;
        } else {
            return;
        }

        if (!(date in dates)) {
            var range = yr.parse(date);
            if (range && range.start && range.start > 1000) {
                dates[date] = Math.floor(range.start / 100) + 1;
            } else {
                dates[date] = 0;
            }
        }

        var artworkID = /^\d+/.exec(path)[0];
        console.log(["frick", artworkID, path, dates[date]].join(","));
    });
