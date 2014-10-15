#!/bin/sh

DIR=$(pwd)

echo "Resetting database..."
neo4j-shell -file cql/reset.cql

echo "Initializing indices..."
neo4j-shell -file cql/init.cql

echo "Importing Artwork/Image mapping..."
cat cql/import-artwork-images.cql | sed "s:FILE:$DIR/data/artwork-image-map.csv:" | neo4j-shell -file -

echo "Importing known image mapping..."
cat cql/import-known-map.cql | sed "s:FILE:$DIR/data/known-map.csv:" | neo4j-shell -file -

echo "Importing image similarity data..."
cat cql/import-similarity.cql | sed "s:FILE:$DIR/data/similarity.csv:" | neo4j-shell -file -

#echo "Exporting Neo4j data dump..."
#neo4j-shell -c dump > data/db.cql