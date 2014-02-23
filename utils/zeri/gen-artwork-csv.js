var fs = require("fs");
var libxmljs = require("libxmljs");

var map = {};

var file = process.argv[2] || "fzeri_F_2014_02_10_105226.xml";

var xmlDoc = libxmljs.parseXml(fs.readFileSync(file, "utf8"));

xmlDoc.find("//SCHEDA").forEach(function(node) {
    var id = node.attr("sercdoa").value();

    if (!map[id]) {
        map[id] = [];
    }

    var path = node.get(".//FOTO").text();

    var imageID = /\/([\w\d]+).jpg/.exec(path)[1];

    // Entry ID:
    // node.attr("sercdf").value()

    map[id].push(imageID);
});

Object.keys(map).sort().forEach(function(id) {
    console.log([id].concat(map[id]).join(","));
});