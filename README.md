MatchEngine Data Analysis
=========================

This project is a collection of Shell and [Cypher](http://neo4j.com/docs/stable/cypher-query-lang.html) scripts for [Neo4j](http://neo4j.com/) that consumes [MatchEngine](https://services.tineye.com/MatchEngine) image similarity data and generates a queryable graph for further analysis.

At the moment the code and scripts in this repository mostly exist to replicate the existing research and results that've been done against the Frick Photoarchive's Anonymous Italian photo archive and the Zeri Foundation's Italian art photo archive. More information about this research, and the results, can be found here:

* http://ejohn.org/research/computer-vision-photo-archives/
* https://www.youtube.com/watch?v=PL6J8MtTsPo

## Importing Data into Neo4j

To start you'll need to make sure that you have a copy of [Neo4j](http://neo4j.com/) installed on your computer. After you have it installed you'll need to start it. Make sure that it's running locally and is available on the default port.

Once you have done that you should be able to run the following command from your shell:

    ./import.sh

This will import all the existing data (seen in the `data/` directory) into your personal copy of Neo4j. After this has been completed you can then open your browser and visit:

    http://localhost:7474/

And you'll be able to query the imported data using Neo4j's [Cypher](http://neo4j.com/docs/stable/cypher-query-lang.html) query language.

## Generating Data

**Artwork-Image Mapping**

**Known Mapping**

**Image Similarity Data**

All image similarity data is generated by using the [MatchEngine tools](https://github.com/jeresig/matchengine-tools).

