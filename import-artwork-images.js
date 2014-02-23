var neo4j = require("node-neo4j");
var async = require("async");
var csv = require("csv-streamify");
var ArgumentParser = require("argparse").ArgumentParser;

var db = new neo4j("http://localhost:7474");

var csvParser = csv({
    objectMode: true
});

var argparser = new ArgumentParser({
    description: "Import collections of artworks and images in Neo4j " +
        "from STDIN."
});

argparser.addArgument(["source"], {
    help: "The name of the source of the data (for labeling)."
});

var args = argparser.parseArgs();

var artworkLabels = ["Artwork", args.source];
var imageLabels = ["Image", args.source];

var createOrFind = function(data, labels, callback) {
    db.cypherQuery("MATCH (n:" + labels[0] + " {data}) RETURN n", {data: data}, function(err, result) {
        if (err || result.data.length === 0) {
            db.insertNode(data, labels, function(err, node) {
                if (err) {
                    console.log(" -- ERROR:", err);
                    return callback(err);
                }
                callback(null, node);
            });
            return;
        }

        callback(err, result.data[0]);
    });
};

var findRelationship = function(original, matched, callback) {
    db.cypherQuery("START a=node({original}), b=node({matched}) MATCH a-[n:photo]->b RETURN n LIMIT 1", {original: original, matched: matched}, function(err, result) {
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

    var artworkData = {id: data.artwork, source: args.source};
    console.log("Creating artwork", data.artwork);
    createOrFind(artworkData, artworkLabels, function(err, artwork) {
        if (err) {
            console.log(" -- ERROR:", err);
            return callback(err);
        }
        console.log(" -- Created:", artwork._id);
        async.eachLimit(data.images, 3, function(imageID, callback) {
            console.log(" -- Inserting image", imageID);
            var imageData = {id: imageID, source: args.source};
            createOrFind(imageData, imageLabels, function(err, image) {
                if (err) {
                    console.log("   -- ERROR:", err);
                    return callback(err);
                }
                console.log("   -- Created:", image._id);
                // TODO: Are we inserting duplicate relationships?
                insertRelationship(artwork._id, image._id, function(err, rel) {
                    if (rel) {
                        console.log("   -- Relationship already exists.");
                        return callback();
                    }

                    console.log("   -- Adding relationship to artwork.");
                    db.insertRelationship(artwork._id, image._id, "photo", {},
                        callback);
                });
            });
        }, callback);
    });
}, 1);

var parseFile = function() {
    console.log("Parsing CSV file...");

    process.stdin
        .pipe(csvParser)
        .on("data", function(data) {
            var artwork = data[0];
            var images = data.slice(1);

            queue.push({
                artwork: artwork,
                images: images
            });
        })
        .on("close", function() {
            queue.push(false);
        });
};

parseFile();