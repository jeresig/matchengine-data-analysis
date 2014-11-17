#!/bin/sh

cd data

echo "Generating known artwork-artwork mapping..."

echo "sourceA,idA,sourceB,idB" > known-map.csv

echo "Generating 15thC Frick-Zeri known artwork mapping..."
cat frick-zeri.tsv | node ../utils/zeri/gen-known-map.js zeri/fzeri_F_2014_02_10_105226.xml >> known-map.csv

echo "Generating 16thC Frick-Zeri known artwork mapping..."
cat frick-zeri.tsv | node ../utils/zeri/gen-known-map.js zeri/fzeri_F_2014_10_10_103330.xml >> known-map.csv
