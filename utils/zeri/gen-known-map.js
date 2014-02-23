var fs = require("fs");
var libxmljs = require("libxmljs");
var csv = require("csv-streamify");
var _ = require("lodash");

var map = {};

var csvFile = process.argv[3] || "frick-zeri.tsv";
var file = process.argv[2] || "fzeri_F_2014_02_10_105226.xml";

var xmlDoc = libxmljs.parseXml(fs.readFileSync(file, "utf8"));

fs.createReadStream(csvFile)
    .pipe(csv({
        objectMode: true,
        delimiter: "\t"
    }))
    .on("data", function(data) {
        if (data[0] && data[2]) {
            var fid = data[0];
            var results = [];

            data[2].split(/,\s*/).forEach(function(id) {
                var node = xmlDoc.get("//SCHEDA[@sercdf='" + id + "']");

                if (node) {
                    var artworkID = node.attr("sercdoa").value();
                    results.push(artworkID);

                    /* // Uncomment to output image file names instead
                    var path = node.get(".//FOTO").text();
                    var imageID = /\/([\w\d]+).jpg/.exec(path)[1];

                    results.push(imageID);
                    */
                } else {
                    //console.log("NOT FOUND", id)
                }
            });

            if (results.length > 0) {
                results = _.uniq(results.sort());
                console.log([fid].concat(results).join(","));
            }
        }
    });