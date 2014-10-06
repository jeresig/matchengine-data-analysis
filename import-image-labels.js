var neo4j = require("node-neo4j");
var csv = require("csv-streamify");
var ArgumentParser = require("argparse").ArgumentParser;

var db = new neo4j("http://localhost:7474");

var csvParser = csv({
    objectMode: true
});

var argparser = new ArgumentParser({
    description: "Import labels for images. Reads a CSV file from STDIN."
});

argparser.addArgument(["source"], {
    help: "The name of the source."
});

var args = argparser.parseArgs();

var getID = function(data, callback) {
    db.cypherQuery("MATCH (n:Image {source:{source}, id:{id}}) RETURN n", data, function(err, result) {
        if (err || result.data.length === 0) {
            console.log("Missing node:", data);
            return callback(err || new Error("Missing node"));
        }

        callback(err, result.data[0]._id);
    });
};

var processNode = function(data, label, callback) {
    console.log("Finding", data.id);

    getID(data, function(err, id) {
        if (!id) {
            console.log(" -- ERROR: Not found.");
            return callback();
        }

        db.addLabelsToNode(id, label, function(err) {
            if (err) {
                console.log(" -- ERROR: Saving Labels.");
            }
            callback();
        });
    });
};

var parseFile = function() {
    console.log("Parsing CSV file...");

    process.stdin
        .pipe(csvParser)
        .on("data", function(data) {
            this.pause();

            process({
                id: data[0],
                source: args.source
            }, data[1], function() {
                this.resume();
            }.bind(this));
        })
        .on("close", function() {
            console.log("DONE");
            process.exit(0);
        });
};

parseFile();