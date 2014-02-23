#!/bin/sh

cat data/frick/artwork-image-map.csv | node import-artwork-images.js frick
cat data/zeri/artwork-image-map.csv | node import-artwork-images.js zeri

node import-similarity.js data/zeri/similarity.json
node import-similarity.js data/frick/similarity.json

cat data/frick-zeri-map.csv | node import-known.js frick zeri

neo4j-shell -c dump > data/db.cql