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

var formatLabels = function(labels) {
    return labels.map(function(label) {
        return ":`" + label + "`";
    }).join("");
};

var createOrFind = function(data, labels, callback) {
    db.cypherQuery("MATCH (n" + formatLabels(labels) +
        " {id: {data}.id, source: {data}.source}) RETURN n LIMIT 1",
        {data: data},
        function(err, result) {
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
    db.cypherQuery("START a=node({original}), b=node({matched}) " +
        "MATCH a-[n:photo]->b RETURN n LIMIT 1",
        {original: original, matched: matched},
        function(err, result) {
            if (err || result.data.length === 0) {
                return callback();
            }

            callback(err, result.data[0]._id);
        });
};

var processArtwork = function(data, callback) {
    var artworkData = {id: data.artwork, source: args.source};
    var thisArtworkLabels = data.labels.concat(artworkLabels);

    console.log("Creating artwork", data.artwork);
    createOrFind(artworkData, thisArtworkLabels, function(err, artwork) {
        if (err) {
            console.log(" -- ERROR:", err);
            return callback(err);
        }

        console.log(" -- Created:", artwork._id);
        async.eachLimit(data.images, 1, function(imageID, callback) {
            var imageData = {id: imageID, source: args.source};
            var thisImageLabels = data.labels.concat(imageLabels);

            console.log(" -- Inserting image", imageID);
            createOrFind(imageData, thisImageLabels, function(err, image) {
                if (err) {
                    console.log("   -- ERROR:", err);
                    return callback(err);
                }

                console.log("   -- Created:", image._id);

                findRelationship(artwork._id, image._id, function(err, rel) {
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
};

var parseFile = function() {
    console.log("Parsing CSV file...");

    var count = 0;

    process.stdin
        .pipe(csvParser)
        .on("data", function(data) {
            this.pause();

            var artwork = data[0];
            var label = data[1];
            var images = data.slice(2);

            processArtwork({
                artwork: artwork,
                labels: label ? [label] : [],
                images: images
            }, function() {
                // Every 100, pause for a second
                if (++count % 100 === 0) {
                    console.log("Waiting...");
                    setTimeout(function() {
                        this.resume();
                    }.bind(this), 1000);
                } else {
                    this.resume();
                }
            }.bind(this));
        })
        .on("end", function() {
            console.log("DONE");
        });
};

parseFile();