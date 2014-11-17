var fs = require("fs");
var libxmljs = require("libxmljs");

var file = process.argv[2] || "fzeri_F_2014_02_10_105226.xml";
var label = process.argv[3] || "15";

var xmlDoc = libxmljs.parseXml(fs.readFileSync(file, "utf8"));

xmlDoc.find("//SCHEDA").forEach(function(node) {
    var id = node.attr("sercdoa").value();
    var path = node.get(".//FOTO").text();
    var imageID = /\/([\w\d]+).jpg/.exec(path)[1];

    if (id && imageID) {
        console.log(["zeri", id, imageID, label].join(","));
    }
});