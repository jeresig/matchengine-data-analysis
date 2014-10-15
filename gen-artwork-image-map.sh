#!/bin/sh

cd data

echo "source,artwork,image,century" > artwork-image-map.csv

echo "Generating Frick artwork/image map..."
cat frick/data.tsv | node frick/gen-artwork-csv.js >> artwork-image-map.csv

echo "Generating 15thC Zeri artwork/image map..."
node zeri/gen-artwork-csv.js zeri/fzeri_F_2014_02_10_105226.xml 15 >> artwork-image-map.csv

echo "Generating 16thC Zeri artwork/image map..."
node zeri/gen-artwork-csv.js zeri/fzeri_F_2014_10_10_103330.xml 16 >> artwork-image-map.csv