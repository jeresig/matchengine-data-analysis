USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file://FILE" AS line
MERGE (artwork:Artwork {id: line.artwork, source: line.source, century: toInt(line.century)})
CREATE (image:Image {id: line.image, source: line.source, century: toInt(line.century)})
CREATE (artwork)-[:photo]->(image);