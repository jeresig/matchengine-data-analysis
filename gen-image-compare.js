var path = require("path");
var fs = require("fs");
var neo4j = require("node-neo4j");
var async = require("async");
var Handlebars = require("handlebars");
var ArgumentParser = require("argparse").ArgumentParser;

var db = new neo4j("http://localhost:7474");

var argparser = new ArgumentParser({
    description: "Generate comparisions between images."
});

argparser.addArgument(["configFile"], {
    help: "File used for configuring the comparisons."
});

argparser.addArgument(["tmplFile"], {
    help: "Template file used for rendering the output."
});

argparser.addArgument(["outputDir"], {
    help: "The directory to output the files to."
});

var args = argparser.parseArgs();

var config = require(path.resolve(__dirname, args.configFile));
var tmplFile = path.resolve(__dirname, args.tmplFile);
var tmpl = Handlebars.compile(fs.readFileSync(tmplFile).toString());

async.eachLimit(Object.keys(config), 1, function(name, callback) {
    console.log("Processing:", name);

    var fileName = path.resolve(args.outputDir, name + ".html");
    var stream = fs.createWriteStream(fileName);
    var options = config[name];

    db.cypherQuery(options.query, function(err, result) {
        if (err) {
            return callback(err);
        }

        fs.writeFile(fileName, tmpl({
            title: options.title,
            results: result.data
        }), callback);

        /*
        .map(function(data) {
                        return {
                    
                        }
                    })
        */

        //console.log(JSON.stringify(result, null, "    "));
    });
}, function(err) {
    console.log("DONE");
});