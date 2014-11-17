#!/bin/sh

cd data

echo "Converting image similarity data..."

echo "sourceA,idA,sourceB,idB,overlap,similarity" > similarity.csv

echo "Converting Frick image similarity data..."
node ../utils/shared/gen-similarity.js frick/similarity.json >> similarity.csv

echo "Converting Zeri image similarity data..."
node ../utils/shared/gen-similarity.js zeri/similarity.json >> similarity.csv
