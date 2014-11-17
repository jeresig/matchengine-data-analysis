var fs = require("fs");
var libxmljs = require("libxmljs");
var csv = require("csv-streamify");

var file = process.argv[2] || "fzeri_F_2014_02_10_105226.xml";

var xmlDoc = libxmljs.parseXml(fs.readFileSync(file, "utf8"));

var done = {};

process.stdin
    .pipe(csv({
        objectMode: true,
        delimiter: "\t"
    }))
    .on("data", function(data) {
        if (data[0] && data[2]) {
            var fid = data[0];

            data[2].split(/,\s*/).forEach(function(id) {
                var node = xmlDoc.get("//SCHEDA[.//INVN[text()='" + id + "']]");

                if (node) {
                    var artworkID = node.attr("sercdoa").value();
                    var doneID = fid + "-" + artworkID;
                    if (!(doneID in done)) {
                        console.log(["frick", fid,
                            "zeri", artworkID].join(","));
                        done[doneID] = true;
                    }
                }
            });
        }
    });