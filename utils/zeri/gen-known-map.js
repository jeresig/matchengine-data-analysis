var fs = require("fs");
var libxmljs = require("libxmljs");
var csv = require("csv-streamify");
var _ = require("lodash");
var through = require("through");

var map = {};

var csvFile = process.argv[3] || "frick-zeri.tsv";
var file = process.argv[2] || "fzeri_OA_2014_03_11_132558.xml";
var outFile = "frick-zeri-map.csv";

var outStream = fs.createWriteStream(outFile);
var xmlDoc = libxmljs.parseXml(fs.readFileSync(file, "utf8"));

fs.createReadStream(csvFile)
    .pipe(csv({
        objectMode: true,
        delimiter: "\t"
    }))
    .pipe(through(function(data) {
        if (!data[0] || !data[1]) {
            return;
        }

        var fid = data[0];
        var results = [];

        data[1].split(/,\s*/).forEach(function(id) {
            var node = xmlDoc.get("//SCHEDA[.//NRSCHEDA[text()='" + id + "']]");

            if (node) {
                var artworkID = node.attr("sercdoa").value();
                results.push(artworkID);

                /* // Uncomment to output image file names instead
                var path = node.get(".//FOTO").text();
                var imageID = /\/([\w\d]+).jpg/.exec(path)[1];

                results.push(imageID);
                */
                console.log("FOUND", id);
            } else {
                console.log("NOT FOUND", id);
            }
        });

        if (results.length > 0) {
            results = _.uniq(results.sort());
            this.queue([fid].concat(results).join(",") + "\n");
        }
    }))
    .pipe(outStream);