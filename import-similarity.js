var path = require("path");
var neo4j = require("node-neo4j");
var async = require("async");
var ArgumentParser = require("argparse").ArgumentParser;

var db = new neo4j("http://localhost:7474");

var argparser = new ArgumentParser({
    description: "Import MatchEngine similarity data into Neo4j."
});

argparser.addArgument(["file"], {
    help: "The JSON similarity file to read in."
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

var findRelationship = function(original, matched, callback) {
    db.cypherQuery("START a=node({original}), b=node({matched}) MATCH a-[n:match]->b RETURN n LIMIT 1", {original: original, matched: matched}, function(err, result) {
        if (err || result.data.length === 0) {
            return callback();
        }

        callback(err, result.data[0]._id);
    });
};

var hasRelationship = function(origData, matchData, callback) {
    db.cypherQuery("START MATCH ({origData})-[n:match]->({matchData}) RETURN n LIMIT 1", {origData: origData, matchData: matchData}, function(err, result) {
        if (err || result.data.length === 0) {
            return callback();
        }

        callback(err, result.data[0]._id);
    });
};

var queue = async.queue(function(data, callback) {
    console.log("Finding", data.original, data.matched);

    hasRelationship(data.original, data.matched, function(err, rel) {
        if (rel) {
            console.log(" -- Already linked.");
            return callback();
        }

        getID(data.original, function(err, original) {
            getID(data.matched, function(err, matched) {
                if (!original || !matched) {
                    console.log(" -- ERROR: Not found.");
                    return callback();
                }

                console.log(" -- Linking", original, matched);
                db.insertRelationship(original, matched, "match", data.data,
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

var parseName = function(file) {
    /(\w+)\/(\w+).jpg/.test(file);
    return {
        source: RegExp.$1 === "italian" ? "frick" : RegExp.$1,
        id: RegExp.$2
    };
};

var parseFile = function() {
    console.log("Parsing JSON file...");

    var data = require(path.resolve(args.file));

    Object.keys(data).forEach(function(image) {
        data[image].forEach(function(match) {
            queue.push({
                original: parseName(image),
                matched: parseName(match.filepath),
                data: {
                    overlap: match.query_overlap_percent,
                    score: match.score
                }
            });
        });
    });

    queue._drain = function() {
        console.log("DONE");
        process.exit(0);
    };
};

parseFile();