var path = require("path");
var neo4j = require("node-neo4j");
var async = require("async");
var csv = require("csv-streamify");
var ArgumentParser = require("argparse").ArgumentParser;

var db = new neo4j("http://localhost:7474");

var csvParser = csv({
    objectMode: true
});

var argparser = new ArgumentParser({
    description: "Import known relationships between artworks."
});

argparser.addArgument(["sourceA"], {
    help: "The name of the source of the first artwork."
});

argparser.addArgument(["sourceB"], {
    help: "The name of the source of the rest of the artworks."
});

var args = argparser.parseArgs();

var getID = function(data, callback) {
    db.cypherQuery("MATCH (n:Artwork {source:{source}, id:{id}}) RETURN n", data, function(err, result) {
        if (err || result.data.length === 0) {
            console.log("Missing node:", data);
            return callback(err || new Error("Missing node"));
        }

        callback(err, result.data[0]._id);
    });
};

var hasRelationship = function(origData, matchData, callback) {
    db.cypherQuery("START MATCH ({origData})-[n:known]-({matchData}) RETURN n LIMIT 1", {origData: origData, matchData: matchData}, function(err, result) {
        if (err || result.data.length === 0) {
            return callback();
        }

        callback(err, result.data[0]._id);
    });
};

var queue = async.queue(function(data, callback) {
    if (data === false) {
        queue.drain = function() {
            console.log("DONE");
            process.exit(0);
        };

        return callback();
    }

    console.log("Finding", data.artworkA, data.artworkB);

    hasRelationship(data.artworkA, data.artworkB, function(err, rel) {
        if (rel) {
            console.log(" -- Already linked.");
            return callback();
        }

        getID(data.artworkA, function(err, original) {
            getID(data.artworkB, function(err, matched) {
                if (!original || !matched) {
                    console.log(" -- ERROR: Not found.");
                    return callback();
                }

                console.log(" -- Linking", original, matched);
                db.insertRelationship(original, matched, "known", data.data,
                    function(err) {
                        if (err) {
                            console.log(" -- ERROR: Saving Relationship.");
                        }
                        callback();
                    });
            });
        });
    });
}, 1);

var parseFile = function() {
    console.log("Parsing CSV file...");

    process.stdin
        .pipe(csvParser)
        .on("data", function(data) {
            var artworkA = data[0];
            var artworksB = data.slice(1);

            artworksB.forEach(function(artworkB) {
                queue.push({
                    artworkA: {
                        id: artworkA,
                        source: args.sourceA
                    },
                    artworkB: {
                        id: artworkB,
                        source: args.sourceB
                    }
                });
            });
        })
        .on("close", function() {
            queue.push(false);
        });
};

parseFile();